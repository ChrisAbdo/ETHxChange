import React from "react";

const TransactionsPage = ({ addToBlockchain, getAllTransactions }) => {
  return (
    <div data-theme="emerald" className="hero bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="card flex-shrink-0 w-full max-w-lg shadow-2xl bg-base-100">
          <div className="card-body">
            <div className="form-control">
              <input
                type="text"
                placeholder="Recipient Address"
                className="input input-bordered"
                id="recipient"
              />
            </div>
            <div className="form-control">
              <input
                type="number"
                placeholder="Amount of ETH"
                className="input input-bordered"
                min={0}
                id="amount"
              />
            </div>
            <div className="form-control">
              <input
                type="text"
                placeholder="Message"
                className="input input-bordered"
                id="message"
              />
            </div>
            <div className="form-control mt-6">
              <button
                id="send"
                onClick={addToBlockchain}
                className="btn btn-primary"
              >
                Send!
              </button>

              <button
                onClick={getAllTransactions}
                // if any of the inputs are empty, disable the button

                className="btn btn-outline btn-ghost mt-2"
              >
                Get All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
