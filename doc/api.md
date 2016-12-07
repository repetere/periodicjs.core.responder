## Classes

<dl>
<dt><a href="#HTML_ADAPTER">HTML_ADAPTER</a> : <code>HTML_Adapter</code></dt>
<dd><p>HTML response adapter class which renders templates from provided data and template names</p>
</dd>
<dt><a href="#JSON_ADAPTER">JSON_ADAPTER</a> : <code>JSON_Adapter</code></dt>
<dd><p>Baseline adapter class which handles wrapping response data in an object with a status code and result message. Formatting is configurable both for success and error responses</p>
</dd>
<dt><a href="#XML_ADAPTER">XML_ADAPTER</a> : <code>XML_Adapter</code></dt>
<dd><p>XML response adapter class which handles wrapping response data in object with status code and result message and converting into XML string.</p>
</dd>
<dt><a href="#CONTENT_ADAPTER_INTERFACE">CONTENT_ADAPTER_INTERFACE</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#findValidViewFromPaths">findValidViewFromPaths(_default, [dirs])</a> ⇒ <code>Object</code></dt>
<dd><p>Iterates through an array of file paths resolving after it finds a valid path or resolves with the default value</p>
</dd>
<dt><a href="#_RENDER">_RENDER(data, options, cb)</a></dt>
<dd><p>Renders an HTML string from provided data</p>
</dd>
<dt><a href="#_ERROR">_ERROR(err, options, cb)</a></dt>
<dd><p>Renders an HTML error page template</p>
</dd>
<dt><a href="#_RENDER">_RENDER(data, options)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates a formatted success response object</p>
</dd>
<dt><a href="#_ERROR">_ERROR(err, options)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates a formatted error response object</p>
</dd>
<dt><a href="#_RENDER">_RENDER(data, options)</a> ⇒ <code>string</code></dt>
<dd><p>Creates a formatted success message and converts to XML</p>
</dd>
<dt><a href="#_ERROR">_ERROR(err, options)</a> ⇒ <code>string</code></dt>
<dd><p>Creates a formatted error response message and converts to XML</p>
</dd>
</dl>

<a name="HTML_ADAPTER"></a>

## HTML_ADAPTER : <code>HTML_Adapter</code>
HTML response adapter class which renders templates from provided data and template names

**Kind**: global class  
**Extends:** <code>JSON_Adapter</code>  

* [HTML_ADAPTER](#HTML_ADAPTER) : <code>HTML_Adapter</code>
    * [new HTML_ADAPTER(options)](#new_HTML_ADAPTER_new)
    * [.render(data, [options], cb)](#HTML_ADAPTER+render) ⇒ <code>Object</code>
    * [.error(err, [options], cb)](#HTML_ADAPTER+error) ⇒ <code>Object</code>

<a name="new_HTML_ADAPTER_new"></a>

### new HTML_ADAPTER(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Configurable options for HTML adapter |
| [options.engine] | <code>Object</code> | <code>ejs</code> | Defines which templating engine to use when rendering template files |
| options.engine.render | <code>function</code> |  | If providing a custom rendering engine module must include a .render function which is synchronous or returns a Promise. Render function should also expect the following arguments in this order: (template_string, template_data, options) |
| [options.engine_configuration] | <code>Object</code> |  | Defines a default set of configuration options that are passed to the rendering function |
| [options.extname] | <code>string</code> |  | Name of a periodicjs extension. Used in finding valid template |
| [options.themename] | <code>string</code> | <code>&quot;\&quot;periodicjs.theme.default\&quot;&quot;</code> | Name of a periodicjs theme. Used in finding valid template |
| [options.viewname] | <code>string</code> |  | Defines a default view name that should be used in rendering |
| [options.fileext] | <code>string</code> | <code>&quot;\&quot;.ejs\&quot;&quot;</code> | Defines the default extension name of the template file |

<a name="HTML_ADAPTER+render"></a>

### htmL_ADAPTER.render(data, [options], cb) ⇒ <code>Object</code>
Renders HTML from provided data and template

**Kind**: instance method of <code>[HTML_ADAPTER](#HTML_ADAPTER)</code>  
**Returns**: <code>Object</code> - Returns a Promise if cb arguement is not provided  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Data that is passed to render template |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for rendering see _RENDER for full details |
| [options.formatRender] | <code>function</code> | <code>_RENDER</code> | Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly |
| cb | <code>function</code> |  | Optional callback function. If arugment is not passed function will |

<a name="HTML_ADAPTER+error"></a>

### htmL_ADAPTER.error(err, [options], cb) ⇒ <code>Object</code>
Renders error view from template

**Kind**: instance method of <code>[HTML_ADAPTER](#HTML_ADAPTER)</code>  
**Returns**: <code>Object</code> - Returns a Promise if cb arguement is not provided  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>\*</code> |  | Any error data that should be passed to template |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for rendering see _ERROR for full details |
| [options.formatError] | <code>function</code> | <code>_RENDER</code> | Custom rendering function. It is not recommended to override the default value of this property and may no longer work properly |
| cb | <code>function</code> |  | Optional callback function. If arugment is not passed function will |

<a name="JSON_ADAPTER"></a>

## JSON_ADAPTER : <code>JSON_Adapter</code>
Baseline adapter class which handles wrapping response data in an object with a status code and result message. Formatting is configurable both for success and error responses

**Kind**: global class  

* [JSON_ADAPTER](#JSON_ADAPTER) : <code>JSON_Adapter</code>
    * [new JSON_ADAPTER([options])](#new_JSON_ADAPTER_new)
    * [.render(data, [options], [cb])](#JSON_ADAPTER+render) ⇒ <code>\*</code>
    * [.error(err, options, [cb])](#JSON_ADAPTER+error) ⇒ <code>\*</code>

<a name="new_JSON_ADAPTER_new"></a>

### new JSON_ADAPTER([options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for the adapter |
| options.formatRender | <code>function</code> |  | Overwrites default formatting behavior for json responses |
| options.formatError | <code>function</code> |  | Overwrites default formatting behavior for errors |

<a name="JSON_ADAPTER+render"></a>

### jsoN_ADAPTER.render(data, [options], [cb]) ⇒ <code>\*</code>
Creates a formatted response

**Kind**: instance method of <code>[JSON_ADAPTER](#JSON_ADAPTER)</code>  
**Returns**: <code>\*</code> - Returns the formatted json object if options.sync is true or a Promise if cb arugement is not passed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | Any data that should be sent with the success response |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for success response formatting see _RENDER for more details |
| options.sync | <code>Boolean</code> |  | If true execution of render will be handled synchronously |
| [cb] | <code>function</code> | <code>false</code> | An optional callback function. If this argument is not a function it will be ignored |

<a name="JSON_ADAPTER+error"></a>

### jsoN_ADAPTER.error(err, options, [cb]) ⇒ <code>\*</code>
Creates a formatted error response

**Kind**: instance method of <code>[JSON_ADAPTER](#JSON_ADAPTER)</code>  
**Returns**: <code>\*</code> - Returns the formatted json object if options.sync is true or a Promise if cb arugement is not passed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>\*</code> |  | Any data to be sent as part of error response |
| options | <code>Object</code> |  | Configurable options for error response formatting see _ERROR for more details |
| options.sync | <code>Boolean</code> |  | If ture execution of error will be handled synchronously |
| [cb] | <code>function</code> | <code>false</code> | An optional callback function. If this argument is not a function it will be ignored |

<a name="XML_ADAPTER"></a>

## XML_ADAPTER : <code>XML_Adapter</code>
XML response adapter class which handles wrapping response data in object with status code and result message and converting into XML string.

**Kind**: global class  
**Extends:** <code>JSON_Adapter</code>  

* [XML_ADAPTER](#XML_ADAPTER) : <code>XML_Adapter</code>
    * [new XML_ADAPTER([options])](#new_XML_ADAPTER_new)
    * [.render(data, [options], [cb])](#XML_ADAPTER+render) ⇒ <code>\*</code>
    * [.error([err], [options], [cb])](#XML_ADAPTER+error) ⇒ <code>\*</code>

<a name="new_XML_ADAPTER_new"></a>

### new XML_ADAPTER([options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for XML adapter |
| options.skip_conversion | <code>Boolean</code> |  | If true render will just return data that is passed to it |
| options.xml_root | <code>string</code> |  | The value that should be used in generating the root tag of the converted XML document |
| options.xml_configuration | <code>Object</code> |  | Options that will be passed to the XML conversion function |

<a name="XML_ADAPTER+render"></a>

### xmL_ADAPTER.render(data, [options], [cb]) ⇒ <code>\*</code>
Creates a formatted XML response

**Kind**: instance method of <code>[XML_ADAPTER](#XML_ADAPTER)</code>  
**Returns**: <code>\*</code> - Returns the formatted XML string if options.sync is true or a Promise if cb arugement is not passed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | Any data that should be sent with the success response |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for the XML success response formatting see _RENDER for more details |
| [options.formatRender] | <code>function</code> | <code>_RENDER</code> | Custom formatting function for XML rendering. It is recommended that the default value for this property is used and only custom options for the XML rendering are passed |
| [cb] | <code>function</code> | <code>false</code> | Optional callback function. If argument is not a function it will be ignored |

<a name="XML_ADAPTER+error"></a>

### xmL_ADAPTER.error([err], [options], [cb]) ⇒ <code>\*</code>
Creates a formatted XML error response

**Kind**: instance method of <code>[XML_ADAPTER](#XML_ADAPTER)</code>  
**Returns**: <code>\*</code> - Returns the formatted XML string if options.sync is true or a Promise if cb arugement is not passed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>\*</code> | <code>{}</code> | Any data that should be sent with the error response |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for the XML error response formatting see _ERROR for more details |
| [options.formatError] | <code>function</code> | <code>_ERROR</code> | Custom formatting function for XML rendering. It is recommended that the default value for this property is used and only custom options for the XML rendering are passed |
| [cb] | <code>function</code> | <code>false</code> | Optional callback function. If argument is not a function it will be ignored |

<a name="CONTENT_ADAPTER_INTERFACE"></a>

## CONTENT_ADAPTER_INTERFACE
**Kind**: global class  

* [CONTENT_ADAPTER_INTERFACE](#CONTENT_ADAPTER_INTERFACE)
    * [new CONTENT_ADAPTER_INTERFACE([options])](#new_CONTENT_ADAPTER_INTERFACE_new)
    * [.create([options])](#CONTENT_ADAPTER_INTERFACE+create) ⇒ <code>Object</code>

<a name="new_CONTENT_ADAPTER_INTERFACE_new"></a>

### new CONTENT_ADAPTER_INTERFACE([options])
Creates an interface


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | A set of properties defined by keys with their allowed types as values. Each property will be required by newly constructed classes from this interface |

<a name="CONTENT_ADAPTER_INTERFACE+create"></a>

### contenT_ADAPTER_INTERFACE.create([options]) ⇒ <code>Object</code>
Constructs a new object with a prototype defined by the .adapter ensuring that instantiated class conforms to interface requirements

**Kind**: instance method of <code>[CONTENT_ADAPTER_INTERFACE](#CONTENT_ADAPTER_INTERFACE)</code>  
**Returns**: <code>Object</code> - Returns an instantiated adapter class  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Values to be passed to class constructor (.adapter should be reserved for either customer class or string that matches key in ADAPTERS) |
| options.adapter | <code>string</code> &#124; <code>function</code> |  | Required to specify type of adapter to be constructed or a class constructor that can be instantiated with new keyword |

<a name="findValidViewFromPaths"></a>

## findValidViewFromPaths(_default, [dirs]) ⇒ <code>Object</code>
Iterates through an array of file paths resolving after it finds a valid path or resolves with the default value

**Kind**: global function  
**Returns**: <code>Object</code> - Returns a Promise which resolves with a file path or the default value  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| _default | <code>string</code> |  | A default value to resolve if no provided file path is valid |
| [dirs] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | File paths to check for validity (file exists) |

<a name="_RENDER"></a>

## _RENDER(data, options, cb)
Renders an HTML string from provided data

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Template data should conform to EJS template by default or custom templating engine |
| options | <code>Object</code> |  | Configurable options for the rendering of HTML string |
| [options.themename] | <code>string</code> | <code>&quot;this.themename&quot;</code> | Specifies a periodic theme folder that will be checked when looking for a matching template |
| [options.viewname] | <code>string</code> | <code>&quot;this.viewname&quot;</code> | Specifies the filename of the template |
| [options.extname] | <code>string</code> | <code>&quot;this.extname&quot;</code> | Specifies a periodicjs extension folder that should be checked when looking for a matching template |
| [options.fileext] | <code>string</code> | <code>&quot;this.fileext&quot;</code> | Specifies the extension name of the template file |
| [options.dirname] | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> |  | Optional custom directories to be checked for template |
| [options.engine_configuration] | <code>Object</code> | <code>this.engine_configuration</code> | Custom configuration object for whichever templating engine being used see EJS documentation for details on options for EJS |
| cb | <code>function</code> |  | Callback function |

<a name="_ERROR"></a>

## _ERROR(err, options, cb)
Renders an HTML error page template

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Object</code> |  | If err is an instanceof Error or has a .message property only the error message will be included |
| options | <code>Object</code> |  | Configurable options for error template rendering see _RENDER for further details on options |
| [options.viewname] | <code>string</code> | <code>&quot;\&quot;home/error404\&quot;&quot;</code> | Overrideable view name for the error template |
| cb | <code>function</code> |  | Callback function |

<a name="_RENDER"></a>

## _RENDER(data, options) ⇒ <code>Object</code>
Creates a formatted success response object

**Kind**: global function  
**Returns**: <code>Object</code> - Formatted success response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | Any data that should be sent with the success response |
| options | <code>Object</code> |  | Configurable options for success response formatting |
| [options.formatRender] | <code>function</code> | <code>this.formatRender</code> | Custom formatting function for json success response. This argument will be ignored if not a function |

<a name="_ERROR"></a>

## _ERROR(err, options) ⇒ <code>Object</code>
Creates a formatted error response object

**Kind**: global function  
**Returns**: <code>Object</code> - Formatted error response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>\*</code> |  | Any data to be sent as part of error response |
| options | <code>Object</code> |  | Configurable options for error response formatting |
| [options.formatError] | <code>function</code> | <code>this.formatError</code> | Custom formatting function for json error response. This argument will be ignored if not a function |

<a name="_RENDER"></a>

## _RENDER(data, options) ⇒ <code>string</code>
Creates a formatted success message and converts to XML

**Kind**: global function  
**Returns**: <code>string</code> - Returns the rendered XML string or the data argument if options.skip_conversion is true  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | Any data to be included in XML response |
| options | <code>Object</code> |  | Configurable options for XML response generation |
| [options.skip_conversion] | <code>Boolean</code> | <code>this.skip_conversion</code> | If true rendering is skipped and the data argument is immediately returned |
| [options.xml_root] | <code>string</code> | <code>&quot;this.xml_root&quot;</code> | Defines the value of the XML document root tag. If this.xml_root is not set and options.xml_root is not provided a TypeError will be thrown |
| [options.xml_configuration] | <code>Object</code> | <code>this.xml_configuration</code> | Options for the convert function see js2xmlparser documentation for full details |

<a name="_ERROR"></a>

## _ERROR(err, options) ⇒ <code>string</code>
Creates a formatted error response message and converts to XML

**Kind**: global function  
**Returns**: <code>string</code> - Returns the rendered XML string or the err argument if options.skip_conversion is true  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>\*</code> |  | Error data to be included in error response. If err is an instanceof Error or has a .message property it is assumed that the .message property is the only thing to include in error response |
| options | <code>Object</code> |  | Configurable options for error XML formatting |
| [options.skip_conversion] | <code>Boolean</code> | <code>this.skip_conversion</code> | If true rendering is skipped and the data argument is immediately returned |
| [options.xml_root] | <code>string</code> | <code>&quot;this.xml_root&quot;</code> | Defines the value of the XML document root tag. If this.xml_root is not set and options.xml_root is not provided a TypeError will be thrown |
| options.xml_configuration | <code>Object</code> |  | Options for the convert function see js2xmlparser documentation for full details |

