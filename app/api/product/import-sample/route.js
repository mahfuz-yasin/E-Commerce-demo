export async function GET() {
    const csv = [
        'name,sellingPrice,mrp,stock,category,description',
        'Example Product 1,500,600,100,Electronics,A sample product',
        'Example Product 2,250,300,50,Clothing,Another sample product',
    ].join('\n')

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="products-sample.csv"',
        }
    })
}
