import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products', error));
  }, []);

  return (
    <div>
      <h1>Welcome to EQuestpro</h1>
      <div>
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <a href={`/product/${product.id}`}>View Details</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;