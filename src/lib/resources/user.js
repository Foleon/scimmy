import Types from "../types.js";
import Messages from "../messages.js";
import Schemas from "../schemas.js";

/**
 * SCIM User Resource
 * @alias SCIMMY.Resources.User
 * @summary
 * *   Handles read/write/patch/dispose operations for SCIM User resources with specified ingress/egress/degress methods.
 * *   Formats SCIM User resources for transmission/consumption using the `{@link SCIMMY.Schemas.User}` schema class.
 */
export class User extends Types.Resource {
    /** @implements {SCIMMY.Types.Resource.endpoint} */
    static get endpoint() {
        return "/Users";
    }
    
    /** @private */
    static #basepath;
    /** @implements {SCIMMY.Types.Resource.basepath} */
    static basepath(path) {
        if (path === undefined) return User.#basepath;
        else if (User.#basepath === undefined)
            User.#basepath = (path.endsWith(User.endpoint) ? path : `${path}${User.endpoint}`);
        
        return User;
    }
    
    /** @implements {SCIMMY.Types.Resource.schema} */
    static get schema() {
        return Schemas.User;
    }
    
    /** @private */
    static #extensions = [];
    /** @implements {SCIMMY.Types.Resource.extensions} */
    static get extensions() {
        return User.#extensions;
    }
    
    /** @private */
    static #ingress = () => {};
    /** @implements {SCIMMY.Types.Resource.ingress} */
    static ingress(handler) {
        User.#ingress = handler;
        return User;
    }
    
    /** @private */
    static #egress = () => {};
    /** @implements {SCIMMY.Types.Resource.egress} */
    static egress(handler) {
        User.#egress = handler;
        return User;
    }
    
    /** @private */
    static #degress = () => {};
    /** @implements {SCIMMY.Types.Resource.degress} */
    static degress(handler) {
        User.#degress = handler;
        return User;
    }
    
    /**
     * Instantiate a new SCIM User resource and parse any supplied parameters
     * @extends SCIMMY.Types.Resource
     */
    constructor(...params) {
        super(...params);
    }
    
    /**
     * @implements {SCIMMY.Types.Resource#read}
     * @returns {SCIMMY.Messages.ListResponse|SCIMMY.Schemas.User}
     * @example
     * // Retrieve user with ID "1234"
     * await (new SCIMMY.Resources.User("1234")).read();
     * @example
     * // Retrieve users with an email ending in "@example.com"
     * await (new SCIMMY.Resources.User({filter: 'email.value -ew "@example.com"'})).read();
     */
    async read(context) {
        if (!this.id) {
            const callbackResult = await User.#egress(this, context);

            if (!Array.isArray(callbackResult)) {
                return new Messages.ListResponse(callbackResult, this.constraints);
            }

            return new Messages.ListResponse(
                callbackResult.map(u => new Schemas.User(u, "out", User.basepath(), this.attributes)),
                this.constraints
            );
        } else {
            try {
                return new Schemas.User((await User.#egress(this, context)).shift(), "out", User.basepath(), this.attributes);
            } catch (ex) {
                if (ex instanceof Types.Error) throw ex;
                else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
                else throw new Types.Error(404, null, `Resource ${this.id} not found`);
            }
        }
    }
    
    /**
     * @implements {SCIMMY.Types.Resource#write}
     * @returns {SCIMMY.Schemas.User}
     * @example
     * // Create a new user with userName "someGuy"
     * await (new SCIMMY.Resources.User()).write({userName: "someGuy"});
     * @example
     * // Set userName attribute to "someGuy" for user with ID "1234"
     * await (new SCIMMY.Resources.User("1234")).write({userName: "someGuy"});
     */
    async write(instance, context) {
        if (instance === undefined)
            throw new Types.Error(400, "invalidSyntax", `Missing request body payload for ${!!this.id ? "PUT" : "POST"} operation`);
        if (Object(instance) !== instance || Array.isArray(instance))
            throw new Types.Error(400, "invalidSyntax", `Operation ${!!this.id ? "PUT" : "POST"} expected request body payload to be single complex value`);
        
        try {
            // TODO: handle incoming read-only and immutable attribute tests
            return new Schemas.User(
                await User.#ingress(this, new Schemas.User(instance, "in"), context),
                "out", User.basepath(), this.attributes
            );
        } catch (ex) {
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }
    
    /**
     * @implements {SCIMMY.Types.Resource#patch}
     * @see SCIMMY.Messages.PatchOp
     * @returns {SCIMMY.Schemas.User}
     * @example
     * // Set userName to "someGuy" for user with ID "1234" with a patch operation (see SCIMMY.Messages.PatchOp)
     * await (new SCIMMY.Resources.User("1234")).patch({Operations: [{op: "add", value: {userName: "someGuy"}}]});
     */
    async patch(message, context) {
        if (message === undefined)
            throw new Types.Error(400, "invalidSyntax", "Missing message body from PatchOp request");
        if (Object(message) !== message || Array.isArray(message))
            throw new Types.Error(400, "invalidSyntax", "PatchOp request expected message body to be single complex value");
        
        try {
            return await new Messages.PatchOp(message)
                .apply(new Schemas.User((await User.#egress(this, context)).shift(), "out"), 
                    async (instance) => await User.#ingress(this, instance, context))
                .then(instance => !instance ? undefined : new Schemas.User(instance, "out", User.basepath(), this.attributes));
        } catch (ex) {
            if (ex instanceof Types.Error) throw ex;
            else if (ex instanceof TypeError) throw new Types.Error(400, "invalidValue", ex.message);
            else throw new Types.Error(404, null, `Resource ${this.id} not found`);
        }
    }
    
    /**
     * @implements {SCIMMY.Types.Resource#dispose}
     * @example
     * // Delete user with ID "1234"
     * await (new SCIMMY.Resources.User("1234")).dispose();
     */
    async dispose(context) {
        if (!!this.id) await User.#degress(this, context);
        else throw new Types.Error(404, null, "DELETE operation must target a specific resource");
    }
}