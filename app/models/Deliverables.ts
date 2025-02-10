import mongoose, { Document, Number, Schema } from 'mongoose';


export interface IDeliverables extends Document{
    projectId: mongoose.Types.ObjectId;
    outlineDocument:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        supervisorGrade: number | null;
        supervisorFeedback: string | null;
        secondReaderGrade: number | null;
        secondReaderFeedback: string | null;

    };
    extendedAbstract:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        supervisorGrade: number | null;
        supervisorFeedback: string | null;
        secondReaderGrade: number | null;
        secondReaderFeedback: string | null;
    };
    finalReport:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        supervisorGrade: number | null;
        supervisorFeedback: string | null;
        secondReaderGrade: number | null;
        secondReaderFeedback: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

const DeliverablesSchema: Schema = new Schema({
    projectId: {type: mongoose.Types.ObjectId, ref: 'Projects', required: true},
    outlineDocument:{
        file: {type: String, default: null},
        uploadedAt: {type: Date, default: null},
        deadline:{type:Date, default: null},
        supervisorGrade: {type:Number, default: null},
        supervisorFeedback: {type: String, default: null},
        secondReaderGrade: {type:Number, default: null},
        secondReaderFeedback: {type: String, default: null},
    },
    extendedAbstract:{
        file: {type: String, default: null},
        uploadedAt: {type: Date, default: null},
        deadline:{type:Date, default: null},
        supervisorGrade: {type:Number, default: null},
        supervisorFeedback: {type: String, default: null},
        secondReaderGrade: {type:Number, default: null},
        secondReaderFeedback: {type: String, default: null},
    },    
    finalReport:{
        file: {type: String, default: null},
        uploadedAt: {type: Date, default: null},
        deadline:{type:Date, default: null},
        supervisorGrade: {type:Number, default: null},
        supervisorFeedback: {type: String, default: null},
        secondReaderGrade: {type:Number, default: null},
        secondReaderFeedback: {type: String, default: null},
    },
    createdAt: { type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});


const Deliverables = mongoose.models.Deliverables || mongoose.model("Deliverables", DeliverablesSchema);

export default Deliverables;