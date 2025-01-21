import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductPage = ({ match }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const { id } = match.params;
    axios.get(\`/api/products/\${id}\`)
      .then(response => setProduct(response.data))
      .catch(error => console.error('Error fetching product', error));
  }, [match.params]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button>Buy Now</button>
    </div>
  );
};

export default ProductPage;