export default {
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Product Name',
        type: 'string',
        validation: Rule => Rule.required()
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'name',
          maxLength: 96,
        },
        validation: Rule => Rule.required()
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'price',
        title: 'Price',
        type: 'number',
        validation: Rule => Rule.required().positive()
      },
      {
        name: 'details',
        title: 'Product Details',
        type: 'text',
      },
      {
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            { title: 'Shoes', value: 'shoes' },
            { title: 'Clothing', value: 'clothing' },
            { title: 'Accessories', value: 'accessories' },
          ],
        },
      },
      {
        name: 'stock',
        title: 'Stock Quantity',
        type: 'number',
        validation: Rule => Rule.required().min(0)
      },
      {
        name: 'featured',
        title: 'Featured Product',
        type: 'boolean',
        initialValue: false,
      },
    ],
    preview: {
      select: {
        title: 'name',
        media: 'image',
        price: 'price'
      },
    },
}