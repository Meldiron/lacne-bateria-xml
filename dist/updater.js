"use strict";
// Run when you need to update XML file on GitHub from MySQL database
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var SQLManager_1 = require("./SQLManager");
var xml_js_1 = __importDefault(require("xml-js"));
var xml_formatter_1 = __importDefault(require("xml-formatter"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var utils_1 = require("./utils");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var con, _a, productsResponse, productImagesResponse, productDescriptionsResponse, products, productImages, productDescriptions, availabilityJson, productsJson, availabilityXml, productsXml;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Starting now", Date.now());
                return [4 /*yield*/, SQLManager_1.SSHConnection];
            case 1:
                con = _b.sent();
                return [4 /*yield*/, Promise.all([
                        con.query("SELECT * FROM oc_product"),
                        con.query("SELECT * FROM oc_product_image"),
                        con.query("SELECT * FROM oc_product_description"),
                    ])];
            case 2:
                _a = _b.sent(), productsResponse = _a[0], productImagesResponse = _a[1], productDescriptionsResponse = _a[2];
                products = productsResponse[0];
                productImages = productImagesResponse[0];
                productDescriptions = productDescriptionsResponse[0];
                availabilityJson = {
                    elements: [
                        {
                            type: "element",
                            name: "AVAILABILITIES",
                            elements: products.map(function (product) {
                                return {
                                    type: "element",
                                    name: "AVAILABILITY",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "ID",
                                            elements: [
                                                { type: "text", text: product.product_id }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "IN_STOCK",
                                            elements: [
                                                { type: "text", text: product.quantity }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "ACTIVE",
                                            elements: [
                                                { type: "text", text: "true" }
                                            ]
                                        }
                                    ]
                                };
                            })
                        }
                    ]
                };
                productsJson = {
                    elements: [
                        {
                            type: "element",
                            name: "ITEMS",
                            elements: products.map(function (product) {
                                var isSmallProduct = true;
                                if (product.weight > 20) {
                                    isSmallProduct = false;
                                }
                                if (product.width > 100 || product.height > 100 || product.length > 100) {
                                    isSmallProduct = false;
                                }
                                if (product.width + product.height + product.length > 175) {
                                    isSmallProduct = false;
                                }
                                var productTitle = product.model;
                                var descriptionsJsonArray = [];
                                var productDescription = productDescriptions.find(function (productDescription) { return productDescription.product_id === product.product_id; });
                                if (productDescription) {
                                    productTitle = productDescription.name;
                                    descriptionsJsonArray.push.apply(descriptionsJsonArray, [
                                        {
                                            type: "element",
                                            name: "SHORTDESC",
                                            elements: [
                                                { type: "text", text: "" + productDescription.meta_description }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "LONGDESC",
                                            elements: [
                                                { type: "text", text: "" + productDescription.description }
                                            ]
                                        }
                                    ]);
                                }
                                var imageJsonArray = __spreadArrays([
                                    {
                                        type: "element",
                                        name: "MEDIA",
                                        elements: [
                                            {
                                                type: "element",
                                                name: "URL",
                                                elements: [
                                                    { type: "text", text: "https://www.lacne-baterie.eu/image/" + product.image }
                                                ]
                                            },
                                            {
                                                type: "element",
                                                name: "MAIN",
                                                elements: [
                                                    { type: "text", text: "true" }
                                                ]
                                            },
                                        ]
                                    }
                                ], productImages.filter(function (productImage) { return productImage.product_id === product.product_id; }).sort(function (a, b) { return a.sort_order < b.sort_order ? -1 : 1; }).map(function (productImage) {
                                    return {
                                        type: "element",
                                        name: "MEDIA",
                                        elements: [
                                            {
                                                type: "element",
                                                name: "URL",
                                                elements: [
                                                    { type: "text", text: "https://www.lacne-baterie.eu/image/" + product.image }
                                                ]
                                            },
                                            {
                                                type: "element",
                                                name: "MAIN",
                                                elements: [
                                                    { type: "text", text: "false" }
                                                ]
                                            },
                                        ]
                                    };
                                }));
                                var productCategoryId = [];
                                var productTitleSimple = utils_1.removeDiacritics(productTitle).split(" ").join("");
                                if (productTitleSimple.includes("tvrdenesklo")) {
                                    productCategoryId.push({
                                        type: "element",
                                        name: "CATEGORY_ID",
                                        elements: [
                                            { type: "text", text: "EF006" }
                                        ]
                                    });
                                }
                                return {
                                    type: "element",
                                    name: "ITEM",
                                    elements: __spreadArrays([
                                        {
                                            type: "element",
                                            name: "ID",
                                            elements: [
                                                { type: "text", text: product.product_id }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "VAT",
                                            elements: [
                                                { type: "text", text: "20" }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "PRICE",
                                            elements: [
                                                { type: "text", text: product.price }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "BARCODE",
                                            elements: [
                                                { type: "text", text: product.ean }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "PRIORITY",
                                            elements: [
                                                { type: "text", text: "1" }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "TITLE",
                                            elements: [
                                                { type: "text", text: productTitle }
                                            ]
                                        }, {
                                            type: "element",
                                            name: "PACKAGE_SIZE",
                                            elements: [
                                                { type: "text", text: isSmallProduct ? 'smallbox' : 'bigbox' }
                                            ]
                                        }
                                    ], descriptionsJsonArray, imageJsonArray, productCategoryId, [
                                        {
                                            type: "element",
                                            name: "DIMENSIONS",
                                            elements: [
                                                {
                                                    type: "element",
                                                    name: "WEIGHT",
                                                    elements: [
                                                        { type: "text", text: product.weight }
                                                    ]
                                                },
                                                {
                                                    type: "element",
                                                    name: "HEIGHT",
                                                    elements: [
                                                        { type: "text", text: product.height }
                                                    ]
                                                },
                                                {
                                                    type: "element",
                                                    name: "WIDTH",
                                                    elements: [
                                                        { type: "text", text: product.width }
                                                    ]
                                                },
                                                {
                                                    type: "element",
                                                    name: "LENGTH",
                                                    elements: [
                                                        { type: "text", text: product.length }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "DELIVERY_DELAY",
                                            elements: [
                                                { type: "text", text: "7" }
                                            ]
                                        },
                                        {
                                            type: "element",
                                            name: "FREE_DELIVERY",
                                            elements: [
                                                { type: "text", text: "false" }
                                            ]
                                        },
                                    ])
                                };
                            })
                        }
                    ]
                };
                availabilityXml = xml_formatter_1.default(xml_js_1.default.json2xml(JSON.stringify(availabilityJson)), {
                    collapseContent: true
                });
                productsXml = xml_formatter_1.default(xml_js_1.default.json2xml(JSON.stringify(productsJson)), {
                    collapseContent: true
                });
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../data/mall_products.xml"), productsXml);
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../data/mall_availability.xml"), availabilityXml);
                return [2 /*return*/];
        }
    });
}); })().then(function () {
    console.log("Finished", Date.now());
    process.exit();
}).catch(function (err) {
    throw err;
});
