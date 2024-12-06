const NotFound = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p>The page youre looking for doesnt exist.</p>
      <a href="/" className="mt-4 text-red-700 hover:text-red-800">Return Home</a>
    </div>
  );
  
  export default NotFound;