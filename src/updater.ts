// Run when you need to update XML file on GitHub from MySQL database

import dotenv from "dotenv";
dotenv.config();

import { SSHConnection } from "./SQLManager";
import convert from "xml-js";
import format from "xml-formatter";

(async () => {
    console.log("Starting now", Date.now());
    const con = await SSHConnection;

    const [productsResponse, productImagesResponse, productDescriptionsResponse] = await Promise.all([
        con.query<any>("SELECT * FROM oc_product"),
        con.query<any>("SELECT * FROM oc_product_image"),
        con.query<any>("SELECT * FROM oc_product_description"),
    ]);

    const products: { [key: string]: any }[] = productsResponse[0];
    const productImages: { [key: string]: any }[] = productImagesResponse[0];
    const productDescriptions: { [key: string]: any }[] = productDescriptionsResponse[0];

    const availabilityJson = {
        elements: [
            {
                type: "element",
                name: "AVAILABILITIES",
                elements: products.map((product) => {
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
                    }
                })
            }
        ]
    };

    const productsJson = {
        elements: [
            {
                type: "element",
                name: "ITEMS",
                elements: products.map((product) => {
                    let isSmallProduct = true;

                    if (product.weight > 20) {
                        isSmallProduct = false;
                    }
                    if (product.width > 100 || product.height > 100 || product.length > 100) {
                        isSmallProduct = false;
                    }
                    if (product.width + product.height + product.length > 175) {
                        isSmallProduct = false;
                    }

                    let productTitle = product.model;
                    const descriptionsJsonArray: any[] = [];

                    const productDescription = productDescriptions.find((productDescription) => productDescription.product_id === product.product_id);
                    if (productDescription) {
                        productTitle = productDescription.name;
                        descriptionsJsonArray.push(...[
                            {
                                type: "element",
                                name: "SHORTDESC",
                                elements: [
                                    { type: "text", text: `${productDescription.meta_description}` }
                                ]
                            },
                            {
                                type: "element",
                                name: "LONGDESC",
                                elements: [
                                    { type: "text", text: `${productDescription.description}` }
                                ]
                            }
                        ]);
                    }

                    const imageJsonArray = [
                        {
                            type: "element",
                            name: "MEDIA",
                            elements: [
                                {
                                    type: "element",
                                    name: "URL",
                                    elements: [
                                        { type: "text", text: `${product.image}` }
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
                        },
                        ...productImages.filter((productImage) => productImage.product_id === product.product_id).sort((a, b) => a.sort_order < b.sort_order ? -1 : 1).map((productImage) => {
                            return {
                                type: "element",
                                name: "MEDIA",
                                elements: [
                                    {
                                        type: "element",
                                        name: "URL",
                                        elements: [
                                            { type: "text", text: `${product.image}` }
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
                        })
                    ];

                    return {
                        type: "element",
                        name: "ITEM",
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
                            },
                            // TODO: CATEGORY_ID, BRAND_ID

                            ...descriptionsJsonArray,
                            ...imageJsonArray,
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
                        ]
                    }
                })
            }
        ]
    }

    const availabilityXml = format(convert.json2xml(JSON.stringify(availabilityJson)), {
        collapseContent: true
    });


    const productsXml = format(convert.json2xml(JSON.stringify(productsJson)), {
        collapseContent: true
    });

    console.log(availabilityXml.length);
    console.log(productsXml.length);
})().then(() => {
    console.log("Finished", Date.now());
    process.exit();
}).catch((err) => {
    throw err;
});