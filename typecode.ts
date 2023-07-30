
// type valueSchema = String | Number | Boolean | Date | Array<TypeSchema> | Buffer | Map<String, Object> | Map<string, any> | BigInt;
// export type TypeSchema = typeof String | typeof Number | typeof Boolean | typeof Date | typeof Array | typeof Buffer | typeof Map | typeof BigInt | { [p: string]: TypeSchema | TypeSchema[] };
// export type RuleSchema = TypeRuleSchema | TypeRuleSchema[]

// type TypeRuleSchema = {
//     type: TypeSchema,
//     required?: boolean,
//     ref?: string,
//     file?: object,
//     of?: valueSchema
// }
// const DataRuleSchema: TypeRuleSchema = {
//     type: String,
//     required: true,
//     ref: '',
//     file: {},
//     of: ''
// }

// export type DescriptionSchema = {
//     [key: string]: RuleSchema;
// }
// const Descriptions = {
//     account: {
//         name: {
//             type: String,
//             required: true as const,
//         },
//         email: {
//             type: String,
//             required: true as const,
//         },
//         userTarg: {
//             type: String,
//         },
//         status: {
//             type: String,
//         },
//         password: {
//             type: String,
//             required: true as const,
//         },
//         telephone: {
//             type: String,
//             required: true as const
//         },
//         address: {
//             type: String,
//             ref: 'address' as const,
//             required: true as const
//         },
//         favorites: {
//             type: String,
//             ref: 'favorites' as const,
//         },
//         bool: {
//             type: Boolean,
//         },
//         num: {
//             type: Number,
//         },
//         int: {
//             type: BigInt,
//         },
//         arrSimple: [{
//             type: String,
//         }],
//         arrFile: [{
//             type: String,
//             file: {

//             }
//         }],
//         arrRef: [{
//             type: String,
//             ref: 'profile' as const,
//         }],
//         obj: [{
//             type: {
//                 salut: String,
//             }
//         }]
//         ,
//         map: {
//             type: Map,
//             of: true
//         }
//         ,
//         map2: {
//             type: Map,
//             of: 'true'
//         }
//     },
//     activity: {
//         poster: {
//             type:String,
//             ref: 'profile' as const,
//             required: true,
//         },
//         channel: {
//             type:String,
//             ref: 'channel' as const,
//         },
//         name: {
//             type: String,
//             required: true,
//         },
//         description: {
//             type: String,
//         },
//         icon: [{
//             required: true,
//             type: String,
//             file: {}
//         }]
//     }
// } satisfies {
//     [key: string]: DescriptionSchema
// }

// export type Account = typeof Descriptions['account'];
// export type Activity = typeof Descriptions['activity'];

// interface Model {

// }

// interface BaseInstance {
//     update: (data: any) => void
//     when: (event: string, listener: any, changeRequired: boolean) => this;
//     extractor: (extractorPath: string) => Promise<BaseInstance | null>;
//     $modelPath: string;
//     $parentModelPath: string | undefined;
//     $parentId: string | undefined;
//     $parentProperty: string | undefined;
//     $model: Model;
//     $id: string;
//     $cache: object;
//     newParentInstance: () => Promise<BaseInstance | null>;
// }

// const obj: BaseInstance = {
//     async update(data) {

//     },
//     when(event: string, listener: any, changeRequired: boolean) {
//         return this;
//     },
//     async extractor(extractorPath: string) {
//         return {} as BaseInstance
//     },
//     $modelPath: 'account',
//     $parentModelPath: 'user',
//     $parentId: '213245645rfg',
//     $parentProperty: 'account',
//     $model: {} as Model,
//     $id: 'rwgrfgrg',
//     $cache: {},
//     newParentInstance: async () => ({} as BaseInstance),
// }

// obj.when('er', 0, true)
// type UrlData = {
//     url: string,
//     size: number,
//     extension: string,
// }

// function getInstanceType<T extends DescriptionSchema>() {

//     const fun = (<k extends keyof TypeRuleSchema, o extends keyof TypeRuleSchema>() => {

//         // type MapValue<T, key extends keyof T> = Map<string, Exclude<typeof t, MapConstructor>>
//         type PropertyTypeOf<key extends keyof T, p extends keyof TypeRuleSchema> = T[key] extends TypeRuleSchema[] ? T[key][0][p] : T[key] extends TypeRuleSchema ? T[key][p] : any;
//         type MapValue<key extends keyof T> = Map<string, PropertyTypeOf<key, o>>
//         //type OF  = 'of' as keyof DataRuleSchema ;

//         type Value<T, key extends keyof T> = T[key] extends { ref: String } ? Promise<BaseInstance> : T[key] extends { type: typeof String } ? String : T[key] extends { type: typeof Number } ? Number : T[key] extends { type: typeof Boolean } ? Boolean : T[key] extends { type: typeof BigInt } ? BigInt : T[key] extends { type: typeof Map } ? MapValue<string & key> : PropertyTypeOf<string & key, k>;
//         type ArrayValue<T, key extends keyof T> = T[key] extends Array<{ file: object }> ? (FileType | UrlData)[] : T[key] extends Array<{ ref: string }> ? Promise<BaseInstance>[] : T[key] extends Array<{ type: typeof String }> ? String[] : T[key] extends Array<{ type: typeof Number }> ? Number[] : T[key] extends Array<{ type: typeof Boolean }> ? Boolean[] : T[key] extends Array<{ type: typeof BigInt }> ? BigInt[] : T[key] extends Array<{ type: typeof Map }> ? MapValue<string & key>[] : PropertyTypeOf<string & key, k>[]

//         type instance = {
//             [key in keyof T as `${string & key}`]: (T[key] extends Array<object> ? (T[key] extends Array<{ required: true }> ? ArrayValue<T, key> : ArrayValue<T, key> | undefined) : (T[key] extends { required: true } ? Value<T, key> : Value<T, key> | undefined)) ///(T[key] extends {required :true } ?(Value<T , key>) : (Value<T , key>) |undefined )
//         }

//         const r = () => {

//         }
//         const obj = {} as (instance & BaseInstance);
//         return obj;
//     })

//     return fun<'type', 'of'>();
// }



// type FileType = {
//     size: number,
//     buffer: Buffer | ArrayBuffer,
//     encoding: 'binary' | 'base64' | 'ascii' | 'hex' | 'base64url' | 'latin1' | 'ucs-2' | 'ucs2' | 'utf-8' | 'utf16le' | 'utf8'         //*NEW_ADD encoding
// } & ({ name: string } | { fileName: string }) & ({ type: string } | { mime: string })

// const SQuery = {

//     async newInstance<T extends DescriptionSchema>(modelPath: keyof typeof Descriptions, option: {
//         id: string
//     }) {

//         type InstanceType = ReturnType<typeof getInstanceType<T>>
//         return new Promise<InstanceType | null>(rev => {
//             let error: string | undefined;
//             setTimeout(async () => {
//                 const objIn: InstanceType = {} as InstanceType;
//                 if (error) rev(objIn)
//                 else rev(null)
//             }, 1000);
//         })
//     }
// };


// (async () => {

//     const a = (await SQuery.newInstance<Activity>('', { id: 'ffrmoknk' }))!;
//     const i = (await SQuery.newInstance<Account>('account', { id: 'ffrmoknk' }))!;
//     i.name = 'noga';
//     i.email = '@';
//     i.password = 'password';
//     i.num;
//     i.address;
//     i.map?.forEach((str) => {
//         console.log(str);

//     });
//     i.map2?.forEach((str) => {
//         console.log(str);

//     });
//     i.int
//     i.obj
    
// })()


// class B {
//     constructor(private e = 0) { }
//     m(a: A) {
//         // return this.e == a.e;
//     }
// }

// const a1 = new A();
// const a2 = new A(3);

// console.log(a1.m(a2));
