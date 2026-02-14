import React from 'react';

const DebugPage: React.FC = () => {
    console.log('Rendering DebugPage');
    return (
        <div className="p-10 bg-white border border-red-500 m-10">
            <h1 className="text-4xl font-black text-black">DEBUG PAGE: IT WORKS!</h1>
            <p className="mt-4">If you can see this, the routing logic is fine.</p>
            <p>Check console for more logs.</p>
        </div>
    );
};

export default DebugPage;
