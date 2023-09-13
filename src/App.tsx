import React from 'react';
import './App.css';
import PDFViewer from './PDFViewer';

function App() {
    return (
        <div className="App">
            <PDFViewer src={"./output.pdf"}/>
        </div>
    );
}

export default App;
