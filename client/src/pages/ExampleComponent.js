// components/ExampleComponent.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLoggedIn } from '../redux/reducers/authSlicer';

const ExampleComponent = () => {
  const dispatch = useDispatch();
  const exampleData = useSelector((state) => state.loggedIn.loggedIn);

  const handleButtonClick = () => {
    dispatch(updateLoggedIn(true));
  };

  return (
    <div>
      <p>Example Data: {String(exampleData)}</p>
      <button onClick={handleButtonClick}>Update Example Data</button>
    </div>
  );
};

export default ExampleComponent;