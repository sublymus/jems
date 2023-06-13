import mongoose, { Schema } from "mongoose";
import { ModelControllers, SQueryMongooseSchema } from "../../lib/squery/Initialize";
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

maker.pre('store', async ({ ctx }) => {

  const first = await ModelControllers["manager"]?.option?.model.findOne({
    isFirst: true
  });
  if (!first) {
    ctx.__permission = 'admin';
    ctx.data.isFirst = true;
    return
  };

  if (first.__key.toString() != ctx.__key) {
    return {
      error: 'You don\'t have a perssion to create a manager',
      code: "Manager Account Not Created",
      message: 'You don\'t have a perssion to create a manager',
      status: 404,
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
