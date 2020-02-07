module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product",
  "description": "A product from Acme's catalog",
  "type": "object",
  "properties": {
    "productId": {
      "title": "Product ID",
      "description": "The unique identifier for a product",
      "type": "number"
    },
    "productName": {
      "title": "Product Name",
      "description": "Name of the product",
      "type": "string"
    },
    "price": {
      "title": "Price",
      "description": "The price of the product",
      "type": "number",
      "exclusiveMinimum": 0
    },
    "tags": {
      "title": "Tags",
      "description": "Tags for the product",
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "dimensions": {
      "title": "Dimensions",
      "type": "object",
      "properties": {
        "length": {
          "title": "Length",
          "type": "number"
        },
        "width": {
          "title": "Width",
          "type": "number"
        },
        "height": {
          "title": "Height",
          "type": "number"
        }
      },
      "required": ["length", "width", "height"]
    }
  },
  "required": ["productId", "productName", "price"]
};