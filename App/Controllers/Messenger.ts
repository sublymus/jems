import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ModelInstanceSchema, ResponseSchema, ResultSchema } from "../../lib/squery/Initialize";
import DiscussionModel from "../Models/DiscussionModel";
Log('Messenger','Messenger');
type UNDEFINED = null|undefined;
const BREAKER_NOT_FOUND = (ctx:ContextSchema,instance:ModelInstanceSchema|null|undefined):instance is UNDEFINED=>{
    let err : ResultSchema|undefined;
    if(!instance){
        err ={
            error: 'NOT_FOUND',
            //debug:'',
            code:'NOT_FOUND',
            status:404,
            message:`Model don't exist`,
        } 
    }else if(!instance?.__exist){
        err ={
            error: 'NOT_FOUND',
            //debug:'',
            code:'NOT_FOUND',
            status:404,
            message:`${instance.__modelPath} don't exist`,
        } 
    }
    if(err){
        const e = new Error(JSON.stringify(err))
        throw e;
    }
    return false;
}

const Messenger: ControllerSchema = {
    createDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        const {}=ctx.data;
        try {
            
            const client= await ModelControllers[ctx.signup.modelPath].option?.model.__findOne({ 
                _id: ctx.signup.id ,

                
            });
            Log('client', {client})
            if (BREAKER_NOT_FOUND(ctx,client))return
            const messenger = await ModelControllers['messenger'].option?.model.findOne({ _id: client.messenger });
            Log('messenger', {messenger})
            if (messenger.opened.length > 0) {
                return {
                    code: "OPERATION_SUCCESS",
                    message: "You allready have a opened discussion",
                    response: messenger.opened[messenger.opened.length - 1],
                    status: 200,
                }
            }
           
            const etp = await ModelControllers['entreprise'].option?.model.findOne();
            Log('entreprise', {etp});
            if (BREAKER_NOT_FOUND(ctx,etp))return
         
            const reslistuser = await ModelControllers[DiscussionModel.modelName]()['list']?.({
                ...ctx,
                __key:client.id,
                data: {
                    addNew: [{
                            client: ctx.login.id,
                            closed: false,
                        }],
                    paging: {
                        query: {
                            __parentModel: `messenger_${client.messenger}_opened_discussion`
                        }
                    }
                }
            });
            Log('reslistuser', {reslistuser});
            if (!reslistuser?.response) return reslistuser;
            const discussionId = reslistuser.response.added;
            const reslist = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                __key:etp.__key,
                data: {
                    addId: [...discussionId],
                    paging: {
                        query: {
                            __parentModel: `entreprise_${etp._id.toString()}_openedDiscussion_discussion`
                        }
                    }
                }
            });
            Log('reslist', {reslist});
            if (!reslist?.response) return reslist;
            Log('allok', 'ok');
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: discussionId,
                status: 200,
            }
        } catch (error) {
            Log('error', {error});
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "Server ERROR",
                status: 404
            }
        }
    },
    joinDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        const {discussionId}= ctx.data;
        try {
            if (ctx.signup.modelPath != 'manager') {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: ctx.signup.modelPath + " can not join discussion",
                    status: 404
                }
            }
            const manager = await ModelControllers['manager'].option?.model.findOne({ _id: ctx.signup.id });
            Log('manager', {manager});
            if (!manager) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "manager not found",
                    status: 404
                }
            }
            const discussion = await ModelControllers['discussion'].option?.model.findOne({ _id: discussionId });
            Log('discussion', {discussion});
            if (BREAKER_NOT_FOUND(ctx,discussion))return
            if (discussion.manager) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "this discussion allready have a manager ",
                    status: 404
                }
            }
            discussion.manager = ctx.login.id;
            await discussion.save();
            Log('discussionSave', {discussion});
            const resList= await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:manager.__key,
                data: {
                    addId: [discussion._id],
                    paging: {
                        query: {
                            __parentModel: `manager_${ctx.signup.id}_currentDiscussions_discussion`
                        }
                    }
                }
            });
            
            if(!resList?.response) return resList;

            const etp = await ModelControllers['entreprise'].option?.model.findOne();
            Log('entreprise', {etp});
            if (!etp) {
                return {
                    error: "Messenger_createDiscussion",
                    code: "NOT_FOUND",
                    message: "entreprise don't exist",
                    status: 404
                }
            }
            const resList2 = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:etp.__key,
                data: {
                    remove: [discussionId],
                    paging: {
                        query: {
                            __parentModel: `entreprise_${etp._id.toString()}_openedDiscussion_discussion`
                        }
                    }
                }
            });
            if(!resList2?.response) return resList2;
            Log('AllOk', 'ok');
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: discussion._id,
                status: 200,
            }
        } catch (error) {
            Log('error', {error});
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "Server ERROR",
                status: 404
            }
        }
    },
    closeDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        const {discussionId} = ctx.data;
        try {
            if (ctx.signup.modelPath != 'manager') {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: ctx.signup.modelPath + " can not close discussion",
                    status: 404
                }
            }
            const discussion = await ModelControllers['discussion'].option?.model.findOne({ _id: discussionId });
            Log('discussion', {discussion});
            if (!discussion) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "discussion not found",
                    status: 404
                }
            }
            if (!discussion.user) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "discussion.user not found",
                    status: 404
                }
            }
            const userAccount = await ModelControllers['account'].option?.model.findOne({ _id: discussion.user });
            Log('userAccount', {userAccount});
            if (!userAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "userAccount not found",
                    status: 404
                }
            }
            const user = await ModelControllers['user'].option?.model.findOne({ __key: userAccount.__key });
            Log('user', {user});
            if (!userAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "user not found",
                    status: 404
                }
            }
            
            const managerAccount = await ModelControllers['account'].option?.model.findOne({ _id: discussion.manager });
            Log('managerAccount', {managerAccount});
            if (!managerAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "managerAccount not found",
                    status: 404
                }
            }
            const manager = await ModelControllers['manager'].option?.model.findOne({ __key: managerAccount.__key });
            Log('manager', {manager});
            if (!managerAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "manager not found",
                    status: 404
                }
            }
            if (manager.__key.toString() != ctx.__key) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "you are not the manager  of this discussion, so you can't close it",
                    status: 404
                }
            }

            discussion.closed = true;

           

            const reslist = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:user.__key,
                __permission:'client:user',
                data: {
                    addId: [discussion._id.toString()],
                    paging: {
                        query: {
                            __parentModel: `messenger_${user.messenger}_closed_discussion`
                        }
                    }
                }
            });
            Log('reslist',reslist)
            if (!reslist?.response) return reslist;

            const reslist2 = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:user.__key,
                __permission:'client:user',
                data: {
                    remove: [discussion._id.toString()],
                    paging: {
                        query: {
                            __parentModel: `messenger_${user.messenger}_opened_discussion`
                        }
                    }
                }
            });
            Log('reslist2',reslist2);
            if (!reslist2?.error) return reslist2

            const list = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:ctx.__key,
                data: {
                    addId: [discussion._id.toString()],
                    paging: {
                        query: {
                            __parentModel: `manager_${ctx.signup.id}_lastDiscussions_discussion`
                        }
                    }
                }
            });
            Log('list',list);
            if(!list?.error) return list;
            
            const reslist3 = await ModelControllers['discussion']()['list']?.({
                ...ctx,
                service: 'list',
                __key:ctx.__key,
                data: {
                    remove: [discussion._id.toString()],
                    paging: {
                        query: {
                            __parentModel: `manager_${ctx.signup.id}_currentDiscussions_discussion`
                        }
                    }
                }
            });
            Log('reslist3',reslist3);
            if (!reslist3?.error) return reslist3

            await discussion.save();

            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: discussion._id,
                status: 200,
            }

        } catch (error) {
            Log('error',error)
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "Server ERROR",
                status: 404
            }
        }
    }
}

const ctrlMaker = CtrlManager({
    ctrl: { messenger:Messenger },
    access: {
        createDiscussion: "any"
    }
})



















