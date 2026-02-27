export default function Signup() {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl mb-4">Signup</h2>

        {/* Manager can select role */}
        <select className="border p-2 w-full mb-3">
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <input className="border p-2 w-full mb-3" placeholder="Email" />
        <input className="border p-2 w-full mb-3" placeholder="Password" />

        <button className="bg-green-600 text-white w-full p-2">
          Create Account
        </button>
      </div>
    </div>
  );
}