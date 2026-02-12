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
            { title: 'Cookies', value: 'cookies' },
            { title: 'Cake', value: 'cake' },
             
          ],
        },
      },
      {
        name: 'stock',
        title: 'Stock Quantity (Legacy - use sizesStock instead)',
        type: 'number',
        validation: Rule => Rule.min(0)
      },
      {
        name: 'sizesStock',
        title: 'Stock by Size',
        type: 'object',
        fields: [
          {
            name: 'small',
            title: 'Small',
            type: 'number',
            initialValue: 0,
            validation: Rule => Rule.min(0)
          },
          {
            name: 'medium',
            title: 'Medium',
            type: 'number',
            initialValue: 0,
            validation: Rule => Rule.min(0)
          },
          {
            name: 'large',
            title: 'Large',
            type: 'number',
            initialValue: 0,
            validation: Rule => Rule.min(0)
          },
        ],
        options: {
          collapsible: true,
          collapsed: false,
        },
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