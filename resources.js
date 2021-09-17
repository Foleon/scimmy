import {Resource} from "./types/resource.js";
import {User} from "./resources/user.js";
import {Group} from "./resources/group.js";
import {Schema} from "./resources/schema.js";
import {ResourceType} from "./resources/resourcetype.js";

/**
 * SCIM Resources Container Class
 */
export default class Resources {
    // Store registered resources for later retrieval
    static #types = {};
    
    // Expose built-in resources without "registering" them
    static Schema = Schema;
    static ResourceType = ResourceType;
    static User = User;
    static Group = Group;
    
    /**
     * Register a resource implementation for exposure as a ResourceType
     * @param {Resource} resource - the resource to register
     * @param {String|Object} [config] - the configuration to feed to the resource being registered
     * @returns {Resource|Resources} the Resources class or registered resource class for chaining
     */
    static declare(resource, config) {
        // Source name from resource if config is an object
        let name = (typeof config === "string" ? config : resource.name);
        if (typeof config === "object") name = config.name ?? name;
        
        // Make sure the registering resource is valid
        if (!resource || !(resource.prototype instanceof Resource))
            throw new TypeError("Registering resource must be of type 'Resource'");
        
        // Prevent registering a resource implementation that already exists
        if (!!Resources.#types[name]) throw new TypeError(`Resource '${name}' already registered`);
        else Resources[name] = Resources.#types[name] = resource;
        
        // Set up the resource if a config object was supplied
        if (typeof config === "object") {
            // Register supplied basepath
            if (typeof config.basepath === "string")
                Resources.#types[name].basepath(config.basepath);
            
            // Register supplied ingress, egress, and degress methods
            if (typeof config.ingress === "function")
                Resources.#types[name].ingress(async (...r) => await config.ingress(...r))
            if (typeof config.egress === "function")
                Resources.#types[name].egress(async (...r) => await config.egress(...r))
            if (typeof config.degress === "function")
                Resources.#types[name].degress(async (...r) => await config.degress(...r))
            
            // Register any supplied schema extensions
            if (Array.isArray(config.extensions))
                for (let {schema, required} of config.extensions) {
                    Resources.#types[name].extend(schema, required);
                }
        }
        
        // If config was supplied, return Resources, otherwise return the registered resource
        return (typeof config === "object" ? Resources : resource);
    }
    
    /**
     * Get registration status of specific resource implementation, or get all registered resource implementations
     * @param {Resource|String} [resource] - the resource implementation or name to query registration status for
     * @returns {Object|Boolean}
     *   - {Object} Containing object with registered resource implementations for exposure as ResourceTypes
     *   - {Boolean} the registration status of the specified resource implementation
     */
    static declared(resource) {
        // If no resource specified, return declared resources
        if (!resource) return {...Resources.#types};
        // If resource is a string, find and return the matching resource type
        else if (typeof resource === "string") return Resources.#types[resource];
        // If the resource is an instance of Resource, see if it is already registered
        else if (resource.prototype instanceof Resource) return Resources.#types[resource.name] === resource;
        // Otherwise, the resource isn't registered...
        else return false;
    }
}