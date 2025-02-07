import mongoose, { Document, Number, Schema } from 'mongoose';


export interface IDeliverables extends Document{
    projectId: mongoose.Types.ObjectId;
    outlineDocument:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        grade: number | null;
    };
    extendedAbstract:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        grade: number | null;

    };
    finalReport:{
        file: string | null;
        uploadedAt: Date | null;
        deadline: Date | null;
        grade: number | null;

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
        grade: {type:Number, default: null},
    },
    extendedAbstract:{
        file: {type: String, default: null},
        uploadedAt: {type: Date, default: null},
        deadline:{type:Date, default: null},
        grade: {type:Number, default: null},

    },    
    finalReport:{
        file: {type: String, default: null},
        uploadedAt: {type: Date, default: null},
        deadline:{type:Date, default: null},
        grade: {type:Number, default: null},

    },
    createdAt: { type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});


const Deliverables = mongoose.models.Deliverables || mongoose.model("Deliverables", DeliverablesSchema);

export default Deliverables;