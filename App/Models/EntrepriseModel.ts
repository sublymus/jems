import mongoose, { Schema } from "mongoose";
import { ModelControllers } from "../../lib/squery/Initialize";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import CountryModel from "./CountryModel";
import ManagerModel from "./ManagerModel";
import TransactionModel from "./Transaction";
import UserModel from "./UserModel";

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
  rates: {
    type: Map,
    //@ts-ignore
    of: Number,
  },
  serviceCharge: {
    type: Number,
  },
  countries: [
    {
      type: Schema.Types.ObjectId,
      ref: CountryModel.modelName,
    },
  ],
});

export const EntrepriseModel = mongoose.model("entreprise", EntrepriseSchema);

const maker = MakeModelCtlForm({
  model: EntrepriseModel,
  schema: EntrepriseSchema,
  volatile: true,
}).pre("create", async () => {
  const etp = await ModelControllers["entreprise"].option?.model.findOne();
  if (etp) {
    return {
      response: etp._id.toString(),
      code: "OPERATION_SUCCESS",
      message: "OPERATION_SUCCESS",
      status: 404,
    };
  }
});
export default EntrepriseModel;
