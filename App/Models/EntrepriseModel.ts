import mongoose, { Schema } from "mongoose";
import Log from "sublymus_logger";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import AccountModel from "./AccountModel";
import CountryModel from "./CountryModel";
import DiscussionModel from "./DiscussionModel";
import ManagerModel from "./ManagerModel";
import UserModel from "./UserModel";
import { ModelControllers } from "../../lib/squery/Initialize";
import TransactionModel from "./Transaction";

const EntrepriseSchema = SQuery.Schema({
  newTransactions: [
    {
      type: Schema.Types.ObjectId,
      ref: TransactionModel.modelName,
      strictAlien: true,
      impact: false,
    },
  ],
  managers: [
    {
      type: Schema.Types.ObjectId,
      ref: ManagerModel.modelName,
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: UserModel.modelName,
    },
  ],
  serviceCharge: {
    type: Number,
  },
  countries: [
    {
      type: Schema.Types.ObjectId,
      ref: CountryModel.modelName,
    },
  ],
  openedDiscussion: [
    {
      type: Schema.Types.ObjectId,
      ref: DiscussionModel.modelName,
      impact: false,
      strictAlien: true,
    },
  ],
});

export const EntrepriseModel = mongoose.model("entreprise", EntrepriseSchema);

const maker = MakeModelCtlForm({
  model: EntrepriseModel,
  schema: EntrepriseSchema,
  volatile: true,
}).pre('create',async ()=>{

  const etp = await ModelControllers['entreprise'].option.model.findOne();
  if(etp){
      return {
          response: etp._id.toString(),
          code: "OPERATION_SUCCESS",
          message:'OPERATION_SUCCESS',
          status: 404
      }
  }
})
export default EntrepriseModel;
