import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import csvParser from 'csv-parser';
import connectMongo from './lib/mongodb';
import User from './app/models/User';
import Programme from './app/models/Programmes';
import Project from './app/models/Projects'; // Import your Project model
import Deliverables from './app/models/Deliverables'; // Adjust path if needed
import Deadline from './app/models/Deadlines';
const parseCSV = (filePath: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

const processCSVData = async (csvFilePath: string): Promise<void> => {
    try {
        await connectMongo();

        const programmes = await Programme.find({});
        if (programmes.length === 0) throw new Error('No programmes found!');

        const users = await parseCSV(csvFilePath);

        for (let row of users) {
            const cleanedRow: any = {};
            for (let key in row) {
                if (row.hasOwnProperty(key)) {
                    cleanedRow[key.trim().replace(/"/g, '')] = row[key].trim();
                }
            }
            // console.log(row)
            const { title, name } = cleanedRow;

            let user = await User.findOne({ name });

            if (!user) {
                console.log(`User not found for: ${name}, creating new lecturer...`);

                const hashedPassword = await hashPassword('123');

                user = await User.create({
                    name: name,
                    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`, // dummy email
                    password: hashedPassword,
                    role: 'Lecturer',
                    approved: true,
                    assigned: false,
                    pfpurl: '',
                    description: '',
                });

                console.log(`Lecturer user created: ${user.name}`);
            }


            const randomProgramme = programmes[Math.floor(Math.random() * programmes.length)];

            const newProject = await Project.findOneAndUpdate(
                { title: title }, // Find project by title
                {
                    title: title,
                    status: true,
                    programme: randomProgramme.name,
                    visibility: 'Public',
                    projectAssignedTo: {
                        supervisorId: user._id,
                        secondReaderId: null,
                        studentsId: [],
                        authorId: user._id,
                    },
                    applicants: [],
                    abstract: 'This is a placeholder abstract.',
                    description: 'This is a placeholder description.',
                    createdAt: new Date(), // Optional: only use this if you want to randomize creation on update
                    updatedAt: new Date(),
                },
                { new: true, upsert: true } // Return updated doc, create if not found
            );
            const deadline = await Deadline.findOne({});
            const deadlineId = deadline._id;

            console.log(`Project upserted: ${newProject.title}`);
            // Check if deliverables already exist for this project
            const existingDeliverables = await Deliverables.findOne({ projectId: newProject._id });
            const updatedDeliverableData = {
                projectId: newProject._id,
                deadlineId: deadlineId,
                outlineDocument: {
                    file: null,
                    uploadedAt: null,
                    supervisorGrade: null,
                    supervisorFeedback: {
                        "Analysis": "",
                        "Design": "",
                        "Implementation": "",
                        "Writing": "",
                        "Evaluation": "",
                        "Overall Achievement": ""
                    },
                    isPublished: false
                },
                extendedAbstract: {
                    file: null,
                    uploadedAt: null,
                    supervisorGrade: null,
                    supervisorFeedback: {
                        "Analysis": "",
                        "Design": "",
                        "Implementation": "",
                        "Writing": "",
                        "Evaluation": "",
                        "Overall Achievement": ""
                    },
                    isPublished: false
                },
                finalReport: {
                    file: null,
                    deadlineId: deadlineId.toString(),
                    uploadedAt: null,
                    supervisorInitialGrade: null,
                    supervisorInitialFeedback: {
                        "Analysis": "",
                        "Design": "",
                        "Implementation": "",
                        "Writing": "",
                        "Evaluation": "",
                        "Overall Achievement": ""
                    },
                    secondReaderInitialGrade: null,
                    secondReaderInitialFeedback: {
                        "Analysis": "",
                        "Design": "",
                        "Implementation": "",
                        "Writing": "",
                        "Evaluation": "",
                        "Overall Achievement": ""
                    },
                    supervisorGrade: null,
                    supervisorFeedback: {
                        "Analysis": "",
                        "Design": "",
                        "Implementation": "",
                        "Writing": "",
                        "Evaluation": "",
                        "Overall Achievement": ""
                    },
                    supervisorInitialSubmit: false,
                    secondReaderInitialSubmit: false,
                    secondReaderSigned: false,
                    supervisorSigned: false,
                    isPublished: false
                },
                updatedAt: new Date()
            };

            if (!existingDeliverables) {
                await Deliverables.create({
                    ...updatedDeliverableData,
                    createdAt: new Date()
                });
                console.log(`Created new deliverables for project: ${newProject.title}`);
            } else {
                await Deliverables.findByIdAndUpdate(existingDeliverables._id, updatedDeliverableData, { new: true });
                console.log(`Updated existing deliverables for project: ${newProject.title}`);
            }



            console.log(`Deliverables created for project: ${newProject.title}`);
        } 

        console.log('Project data import complete.');

    } catch (error) {
        console.error('Error processing CSV data:', error);
    }
};

const csvFilePath = './projects.csv';
processCSVData(csvFilePath);
