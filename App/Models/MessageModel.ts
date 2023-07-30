import mongoose, { Schema } from "mongoose";
import { Config } from "../../lib/squery/Config";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";

let MessageSchema = SQuery.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
    strictAlien: true,
    impact: false,
  },
  text: {
    type: String,
  },
  files: [
    {
      type: SQuery.FileType,
      required: true,
      file: {
        length: [0, 4],
        type: ["*/*"],
        size: [1, 4e10],
        dir: ["fs"],
      },
    },
  ],
});

const MessageModel = mongoose.model("message", MessageSchema);

const ctrlMaker = MakeModelCtlForm({
  schema: MessageSchema,
  model: MessageModel,
});

ctrlMaker.pre("create", async ({ ctx }) => {
  if (ctx.__permission == "admin") return;
  ctx.data.account = ctx.login.id;
});

ctrlMaker.pre("list", async ({ ctx }) => {
  if (ctx.data.paging?.query?.__parentModel.startsWith("discussion")) {
    delete ctx.data.remove;
  }
});
export default MessageModel;
