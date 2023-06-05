import mongoose from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { Config } from "../../lib/squery/Config";

let AccountSchema = SQuery.Schema({
    name: {
        type: String,
        trim: true,
        minlength: [3, "trop court"],
        maxlength: [20, "trop long"],
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4,
        access: "private",
    },
    telephone: {
        type: String,
        required: true,
        unique: true,
        access:'share',
        share:'carte',
    },
    /*
    
    await instance.rule({
        'carte':{
            add:{
                id:'',
                modelPath:'user',
                rule:'a-w-r'
            }
            remove:{
                id:'',
            }
        }
    })
    await instance.rule({
        'carte':{
            add:{
                id:'',
                modelPath:'user',
                rule:'a-w-r'
            }
            remove:{
                id:'',
            }
        }
    })
    
    */
    carte: {
        type: String,
        unique: true,
        access:'share',
        share:{
            only:['client:user','client:manager'],
            target:{
                maxMember:120,
                addSelf:true,
                allow:['a','l','w','r','fd'],
            }
        },
    },
    __$carte:[{
        type :{
            id:Number,
            modelPath:String,
            rule:[String]
        }
    }],
    imgProfile: [{
        type: SQuery.FileType,
        file: {
            size: [1, 1e8],
            length: [0, 4],
            dir: [Config.conf.rootDir,'fs','fa','fb'],
        }
    }]
});

const AccountModel = mongoose.model("account", AccountSchema);

MakeModelCtlForm({
    schema: AccountSchema,
    model: AccountModel,
});
export default AccountModel;
