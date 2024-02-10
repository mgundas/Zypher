import React, { useRef } from 'react';
import axios from "axios"

export const Upload = () => {
  const fileInput = useRef();

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', fileInput.current.files[0]);

    try {
      const response = await axios.post('http://localhost/api/image/upload', formData, {
        headers: {
          'Content-Type':'multipart/form-data',
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleUpload} encType="multipart/form-data">
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Pick a file</span>
        </div>
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          ref={fileInput}
        />
      </label>
      <button type="submit" className="btn btn-primary">
        Upload
      </button>
    </form>
  );
};