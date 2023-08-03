import Types from "../types.js";
import Schemas from "../schemas.js";
import Config from "../config.js";

/**
 * SCIM ServiceProviderConfig Resource
 * @alias SCIMMY.Resources.ServiceProviderConfig
 * @summary
 * *   Formats SCIM Service Provider Configuration set in `{@link SCIMMY.Config}` for transmission/consumption according to the Service Provider Configuration schema set out in [RFC7643§5](https://datatracker.ietf.org/doc/html/rfc7643#section-5).
 */
export class ServiceProviderConfig extends Types.Resource {
    /** @implements {SCIMMY.Types.Resource.endpoint} */
    static get endpoint() {
        return "/ServiceProviderConfig";
    }
    
    /** @private */
    static #basepath;
    /** @implements {SCIMMY.Types.Resource.basepath} */
    static basepath(path) {
        if (path === undefined) return ServiceProviderConfig.#basepath;
        else if (ServiceProviderConfig.#basepath === undefined)
            ServiceProviderConfig.#basepath = (path.endsWith(ServiceProviderConfig.endpoint) ? path : `${path}${ServiceProviderConfig.endpoint}`);
        
        return ServiceProviderConfig;
    }
    
    /**
     * @implements {SCIMMY.Types.Resource.extend}
     * @throws {TypeError} SCIM 'ServiceProviderConfig' resource does not support extension
     */
    static extend() {
        throw new TypeError("SCIM 'ServiceProviderConfig' resource does not support extension");
    }
    
    /**
     * Instantiate a new SCIM ServiceProviderConfig resource and parse any supplied parameters
     * @extends SCIMMY.Types.Resource
     */
    constructor(...params) {
        super(...params);
        
        // Bail out if a resource is requested with filter or attribute properties
        if (!!Object.keys(this).length)
            throw new Types.Error(403, null, "ServiceProviderConfig does not support retrieval by filter");
    }
    
    /**
     * @implements {SCIMMY.Types.Resource#read}
     * @returns {SCIMMY.Schemas.ServiceProviderConfig}
     */
    async read(context) {
        return new Schemas.ServiceProviderConfig(Config.get(), ServiceProviderConfig.basepath());
    }
}