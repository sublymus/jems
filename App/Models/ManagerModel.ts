import mongoose, { Schema } from "mongoose";
import { SQueryMongooseSchema } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import UserModel from "./UserModel";
import ManagerPreferenceModel from "./ManagerPreference";
import DiscussionModel from "./DiscussionModel";
import TransactionModel from "./Transaction";
import { access } from "fs";

const managerSchema = SQuery.Schema({
  ...(UserModel.schema as any).description,
  entreprise:{
    type:Schema.Types.ObjectId,
    ref:'entreprise',
    access:'admin'
  },
  currentDiscussions:[{
    type:Schema.Types.ObjectId,
    ref:DiscussionModel.modelName,
    strictAlien:true,
    impact:false,
    access:'admin'
  }],
  lastDiscussions:[{
    type:Schema.Types.ObjectId,
    ref:DiscussionModel.modelName,
    strictAlien:true,
    impact:false,
    access:'admin'
  }],
  managerTransactions : [{
    type: Schema.Types.ObjectId,
    ref:TransactionModel.modelName,
    access:'admin',
    impact:false,
    strictAlien: true,
  }],
  managerPreference:{
    type:Schema.Types.ObjectId,
    ref:ManagerPreferenceModel.modelName,
    access:'admin'
  }
});
export const ManagerModel = mongoose.model("manager", managerSchema);

const maker = MakeModelCtlForm({
  model: ManagerModel,
  schema: managerSchema,
});

maker.pre('store',async({ctx})=>{
  if( ctx.__permission != 'client:manager'){
    return {
      error: 'Only manager can create account for another manager',
      code:"Manager ACount Not Created",
      message:'Only manager can create account for another manager',
      status:404,
    }
  }
});
maker.tools.assigneToNewListElement({
  parentModelPath: 'entreprise',
  parentListProperty: 'managers',
  targetExtractorPath: './',
  targetProperty: 'entreprise',
  sourceExtractorPath: './',
  sourceProperty: '_id',
});

export default ManagerModel;
