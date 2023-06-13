import mongoose from "mongoose";
import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import {
  ControllerSchema,
  ModelControllers,
  ResponseSchema,
} from "../../lib/squery/Initialize";
import { formatModelInstance } from "../../lib/squery/ModelCtrlManager";

const Transaction: ControllerSchema = {
  start: async (ctx: ContextSchema): ResponseSchema => {
    console.log("🚀 ~ file: Transaction.ts:14 ~ start: ~ ctx:", ctx.signup);

    const client = await ModelControllers[
      ctx.signup.modelPath
    ]?.option?.model.findOne({
      _id: ctx.signup.id,
    });

    Log("client", { client });
    if (!client) {
      //
      return {
        error: "Transaction_new_Use_not_Found",
        code: "NOT_FOUND",
        message: ctx.signup.modelPath + " don't exist",
        status: 404,
      };
    }
    let transactions: mongoose.ObjectId[] = await client.transactions;

    for (let index = 0; index < transactions.length; index++) {
      const element = transactions[index];
      console.log("🚀 ~ file: Transaction.ts:34 ~ start: ~ element:", element);

      const transaction = await ModelControllers[
        "transaction"
      ]?.option?.model.findOne({
        _id: element,
      });
      console.log(
        "🚀 ~ file: Transaction.ts:37 ~ start: ~ transaction:",
        transaction
      );

      if (transaction.status === "start") {
        return {
          code: "OPERATION_SUCCESS",
          message: "OPERATION_SUCCESS",
          response: transaction._id,
          status: 200,
        };
      }
    }

    // (await transactions.page()).items.length;
    // const resCurrent = await ModelControllers["transaction"]()["list"]({
    //   ...ctx,
    //   service: "list",
    //   __key: client.__key,
    //   data: {
    //     paging: {
    //       query: {
    //         status: "start",
    //         __parentModel: `${ctx.signup.modelPath}_${ctx.signup.id}_transactions_transaction`,
    //       },
    //     },
    //   },
    // });

    // Log("resCurrent", { resCurrent: resCurrent.response.items });
    // if (resCurrent.error) return resCurrent;

    // if (resCurrent.response.items && resCurrent.response.items.length > 0) {
    //   return {
    //     code: "OPERATION_SUCCESS",
    //     message: "OPERATION_SUCCESS",
    //     response: resCurrent.response.items[0]._id,
    //     status: 200,
    //   };
    // }
    const etp = await ModelControllers["entreprise"]?.option?.model.findOne();
    Log("etp", { etp });

    if (!etp) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "entreprise don't exist",
        status: 404,
      };
    }
    const resT = await ModelControllers["transaction"]()["list"]?.({
      ...ctx,
      __permission: "admin",
      __key: ctx.__key,
      data: {
        addNew: [
          {
            senderAccount: ctx.login.id,
            status: "start",
            //manager: discussion.manager
            //discussion: discussion._id.tostring()
          },
        ],
        paging: {
          query: {
            __parentModel: `${ctx.signup.modelPath}_${ctx.signup.id}_transactions_transaction`,
          },
        },
      },
    });
    Log("resT", { resT });
    if (!resT?.response) return resT;
    const resET = await ModelControllers["transaction"]()["list"]?.({
      ...ctx,
      __permission: "admin",
      __key: etp.__key.toString(),
      data: {
        addId: [...resT.response.added],
        paging: {
          query: {
            __parentModel: `entreprise_${etp._id.toString()}_newTransactions_transaction`,
          },
        },
      },
    });

    Log("resET", { resET });
    if (!resET?.response) return resET;

    return {
      code: "OPERATION_SUCCESS",
      message: "OPERATION_SUCCESS",
      response: resET.response.added[0],
      status: 200,
    };
  },
  full: async (ctx: ContextSchema): ResponseSchema => {
    const {
      data: { id },
    } = ctx;
    console.log("🚀 ~ file: Transaction.ts:113 ~ full: ~ ctx:", ctx.data);
    const lastVal = "start",
      newVal = "full";

    const res = await ModelControllers["transaction"]()["update"]?.({
      ...ctx,
      __permission: "admin",
      service: "update",
    });

    if (!res?.response) return res;

    const transaction = await ModelControllers[
      "transaction"
    ]?.option?.model.findOne({
      _id: id,
    });
    console.log("🚀 ~ file: Transaction.ts:162 ~ full: ~ ctx.data:", ctx.data);
    console.log(
      "🚀 ~ file: Transaction.ts:158 ~ full: ~ transaction:",
      transaction
    );

    if (!transaction.received) {
      return {
        error: "Transaction_full",
        code: "NOT_FOUND",
        message: "transaction don't exist",
        status: 404,
      };
    }
    if (!transaction.sent) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.sum don't exist",
        status: 404,
      };
    }
    console.log(
      !transaction.senderFile || transaction.senderFile.length === 0,
      "isTRueorFAlse"
    );

    if (!transaction.senderFile || transaction.senderFile.length === 0) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.senderFile don't exist",
        status: 404,
      };
    }
    if (!transaction.country) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.country don't exist",
        status: 404,
      };
    }
    console.log(!transaction.telephone || !transaction.carte, transaction);

    if (!(transaction.telephone || transaction.carte)) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.telephone or transaction.carte  don't exist",
        status: 404,
      };
    }
    if (!transaction.agenceReceiver) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.agenceReceiver don't exist",
        status: 404,
      };
    }
    if (!transaction.agenceSender) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.agenceSender don't exist",
        status: 404,
      };
    }
    if (!transaction.typeTransaction) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: "transaction.typeTransaction don't exist",
        status: 404,
      };
    }

    if (transaction.status != lastVal) {
      return {
        error: "Transaction_new",
        code: "NOT_FOUND",
        message: `status <${lastVal}> is required to get status<${newVal}>`,
        status: 404,
      };
    }
    const res2 = await ModelControllers["transaction"]()["update"]?.({
      ...ctx,
      __permission: "admin",
      service: "update",
      data: {
        id: id,
        status: transaction.manager ? "run" : newVal,
      },
    });
    if (!res2?.error) return res2;
    return {
      code: "OPERATION_SUCCESS",
      message: "OPERATION_SUCCESS",
      response: id,
      status: 200,
    };
  },
  run: async (ctx: ContextSchema): ResponseSchema => {
    if (ctx.signup.modelPath != "manager") {
      return {
        error: "NOT_FOUND",
        code: "NOT_FOUND",
        message: ctx.signup.modelPath + " can not run transaction",
        status: 404,
      };
    }
    const manager = await ModelControllers["manager"]?.option?.model.findOne({
      _id: ctx.signup.id,
    });
    Log("manager", { manager });
    if (!manager) {
      return {
        error: "NOT_FOUND",
        code: "NOT_FOUND",
        message: "manager not found",
        status: 404,
      };
    }
    return await updateTransaction(ctx, "run", "end");
  },
  join: async (ctx: ContextSchema): ResponseSchema => {
    try {
      if (ctx.signup.modelPath != "manager") {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: ctx.signup.modelPath + " can not join transaction",
          status: 404,
        };
      }
      const manager = await ModelControllers["manager"]?.option?.model.findOne({
        _id: ctx.signup.id,
      });
      Log("manager", { manager });
      if (!manager) {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: "manager not found",
          status: 404,
        };
      }
      const transaction = await ModelControllers[
        "transaction"
      ]?.option?.model.__findOne({ _id: ctx.data.id });
      Log("transaction", { transaction });
      if (!transaction) {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: "transaction not found",
          status: 404,
        };
      }
      if (transaction.manager) {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: "this transaction already have a manager ",
          status: 404,
        };
      }
      transaction.manager = ctx.login.id;
      if (transaction.status == "full") transaction.status = "run";
      await transaction.save();

      if (transaction.discussion) {
        const res = await ModelControllers["discussion"]()["update"]?.({
          ...ctx,
          __permission: "admin",
          service: "update",
          data: {
            id: transaction.discussion,
            manager: ctx.login.id,
          },
        });
        Log("resDisc", res);
      }

      const etp = await ModelControllers["entreprise"]?.option?.model.findOne();
      Log("etp", { etp });

      if (!etp) {
        return {
          error: "Transaction_new",
          code: "NOT_FOUND",
          message: "entreprise don't exist",
          status: 404,
        };
      }
      const resET = await ModelControllers["transaction"]()["list"]?.({
        ...ctx,
        __permission: "admin",
        __key: etp.__key.toString(),
        data: {
          remove: [ctx.data.id],
          paging: {
            query: {
              __parentModel: `entreprise_${etp._id.toString()}_newTransactions_transaction`,
            },
          },
        },
      });
      Log("resET", resET);
      if (!resET?.response) return resET;

      const resListCM = await ModelControllers["transaction"]()["list"]?.({
        ...ctx,
        __permission: "admin",
        __key: ctx.__key,
        data: {
          addId: [transaction._id.toString()],
          paging: {
            query: {
              __parentModel: `manager_${ctx.signup.id}_managerTransactions_transaction`,
            },
          },
        },
      });
      Log("resListCM", resListCM);
      if (!resListCM?.response) return resListCM;
      return {
        code: "OPERATION_SUCCESS",
        message: "OPERATION_SUCCESS",
        response: ctx.data.id,
        status: 200,
      };
    } catch (error: any) {
      return {
        error: "SERVER_ERROR",
        code: "SERVER_ERROR",
        message: error.message,
        status: 502,
      };
    }
  },
  end: async (ctx: ContextSchema): ResponseSchema => {
    const lastVal = "run",
      newVal = "end";
    try {
      if (ctx.signup.modelPath != "manager") {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: ctx.signup.modelPath + " can not run transaction",
          status: 404,
        };
      }
      const manager = await ModelControllers["manager"]?.option?.model.findOne({
        _id: ctx.signup.id,
      });
      Log("manager", { manager });
      if (!manager) {
        return {
          error: "NOT_FOUND",
          code: "NOT_FOUND",
          message: "manager not found",
          status: 404,
        };
      }
      const transaction = await ModelControllers[
        "transaction"
      ]?.option?.model.findOne({
        _id: ctx.data.id,
      });
      if (!transaction) {
        return {
          error: "Transaction_new",
          code: "NOT_FOUND",
          message: "transaction don't exist",
          status: 404,
        };
      }
      if (transaction.status != lastVal) {
        return {
          error: "Transaction_new",
          code: "NOT_FOUND",
          message: `status <${lastVal}> is required to get status<${newVal}>`,
          status: 404,
        };
      }
      const res = await ModelControllers["transaction"]()["update"]?.({
        ...ctx,
        __permission: "admin",
        service: "update",
        data: {
          id: ctx.data.id,
          status: newVal,
          managerFile: ctx.data.managerFile,
        },
      });
      return res;
    } catch (error: any) {
      return {
        error: "SERVER_ERROR",
        code: "SERVER_ERROR",
        message: error.message,
        status: 502,
      };
    }
  },
  addDiscussion: async (ctx: ContextSchema): ResponseSchema => {
    try {
      const transaction = await ModelControllers[
        "transaction"
      ]?.option?.model.findOne({
        _id: ctx.data.id,
      });
      if (!transaction) {
        return {
          error: "Transaction_new",
          code: "NOT_FOUND",
          message: "transaction don't exist",
          status: 404,
        };
      }
      if (transaction.status === "end") {
        return {
          error: "Transaction_addDiscussion",
          code: "NOT_FOUND",
          message: "transaction is already closed",
          status: 404,
        };
      }
      Log("transaction", transaction._id);

      if (transaction.discussion) {
        return {
          code: "OPERATION_SUCCESS",
          message: "OPERATION_SUCCESS",
          response: transaction.discussion,
          status: 200,
        };
      }
      const res = await ModelControllers["transaction"]()["update"]?.({
        ...ctx,
        __permission: "admin",
        __key: transaction.__key.toString(),
        data: {
          id: ctx.data.id,
          discussion: {
            client: transaction.senderAccount.toString(),
            manager: transaction.manager?.toString(),
            closed: false,
          },
          managerFile: ctx.data.managerFile,
        },
      });
      Log("res", res?.response);
      return res;
    } catch (error: any) {
      return {
        error: "SERVER_ERROR",
        code: "SERVER_ERROR",
        message: error.message,
        status: 502,
      };
    }
  },
  list: async (ctx: ContextSchema): ResponseSchema => {

    try {
      const {filter} = ctx.data;

    if (ctx.signup.modelPath != "manager") {
      return {
        error: "Only manager can user this service",
        code: "Only manager can user this service",
        message: "Only manager can user this service",
        status: 404,
      };
    }
    const listTransaction : Array <any>= await ModelControllers["transaction"]?.option?.model.find(filter);

    for (const instance of listTransaction) {
      formatModelInstance(ctx,'read','transaction',instance);
    }

    return {
      response: listTransaction,
      code: "OPERATION_SUCCESS",
      message: "OPERATION_SUCCESS",
      status: 200,
    };
    } catch (error:any) {
      return {
        error: "SERVER_ERROR",
        code: "SERVER_ERROR",
        message: error.message,
        status: 502,
      };
    }
    
  },
};

async function updateTransaction(
  ctx: ContextSchema,
  lastVal: string,
  newVal: string
) {
  const transaction = await ModelControllers[
    "transaction"
  ]?.option?.model.findOne({
    _id: ctx.data.id,
  });
  if (!transaction) {
    return {
      error: "Transaction_new",
      code: "NOT_FOUND",
      message: "transaction don't exist",
      status: 404,
    };
  }
  if (transaction.status != lastVal) {
    return {
      error: "Transaction_new",
      code: "NOT_FOUND",
      message: `status <${lastVal}> is required to get status<${newVal}>`,
      status: 404,
    };
  }
  const res = await ModelControllers["transaction"]()["update"]?.({
    ...ctx,
    __permission: "admin",
    service: "update",
    data: {
      id: ctx.data.id,
      status: newVal,
    },
  });
  return res;
}
const ctrlMaker = CtrlManager({
  ctrl: { transaction: Transaction },
  access: {
    like: "any",
  },
});

ctrlMaker.post("like", async (e) => {});

