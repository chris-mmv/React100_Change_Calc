import "./App.css";
import { useState } from "react";

function App() {
  // Add your code here
  const fixedPenny = 0.01;
  const [amountDue, setAmountDue] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [changeDue, setChangeDue] = useState(null);

  const moneyRegex = /^\d+(\.\d{1,2})?$/;

  //is amount due valid money format? if so, convert to number
  const dueValid = amountDue !== "" && moneyRegex.test(amountDue);
  const dueNum = dueValid ? parseFloat(amountDue) : NaN;

  //is amount received valid money format? if so, convert to number
  const receivedValid =
    amountReceived !== "" && moneyRegex.test(amountReceived);
  const receivedNum = receivedValid ? parseFloat(amountReceived) : NaN;

  // Missing or invalid due amount
  const dueMissingOrInvalid = amountDue === "" || !dueValid;

  // Show the "due missing" error if received is filled and valid, but due is missing/invalid
  const showDueRequiredError =
    amountReceived !== "" && receivedValid && dueMissingOrInvalid;

  // Only show the "received < due" error if BOTH fields are valid money
  const receivedTooLow =
    !dueMissingOrInvalid && receivedValid && receivedNum < dueNum;

  //once both inputs are valid, check if received >= due
  const receivedGreen =
    !dueMissingOrInvalid && receivedValid && receivedNum >= dueNum;

  //change button based on inputs
  const hasAnyInput = amountDue !== "" || amountReceived !== "";
  const buttonVariant = !hasAnyInput
    ? "btn-primary"
    : receivedGreen
      ? "btn-success"
      : "btn-danger";

  const handleDueChange = (e) => {
    setAmountDue(e.target.value);
    setChangeDue(null);
  };

  const handleReceivedChange = (e) => {
    setAmountReceived(e.target.value);
    setChangeDue(null);
  };

  return (
    <>
      <header>
        <div className="container text-left">
          <div className="col">
            <h1 className="display-1">Change Calculator</h1>
          </div>
        </div>
      </header>

      <main>
        <div className="row g-3">
          <div className="container text-center">
            {/* <div className="row justify-content-start"> */}
            <div className="col-4 justify-content-center p-5">
              {/* Amount Due Input */}
              <div className="form-floating mb-3">
                <input
                  className={`form-control ${
                    amountDue ? (dueValid ? "is-valid" : "is-invalid") : ""
                  }`}
                  id="amountDue"
                  data-testid="amountDue"
                  step="0.01"
                  type="number"
                  value={amountDue}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={handleDueChange}
                />

                {/* Invalid money format */}
                {!dueValid && amountDue && (
                  <div className="text-danger small mt-1 d-block">
                    Enter a dollar amount like <strong>12.34</strong> (max 2
                    decimals)
                  </div>
                )}

                <label
                  htmlFor="amountDue"
                  className={!dueValid && amountDue ? "text-danger" : ""}
                >
                  {!dueValid && amountDue ? "Incorrect Format!" : "Amount Due"}
                </label>
              </div>

              {/* Amount Received Input */}
              <div className="form-floating mb-3">
                <input
                  className={`form-control ${
                    amountReceived
                      ? receivedGreen
                        ? "is-valid"
                        : "is-invalid"
                      : ""
                  }`}
                  id="amountReceived"
                  data-testid="amountReceived"
                  step="0.01"
                  type="number"
                  value={amountReceived}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={handleReceivedChange}
                />
                {/* Invalid money format */}
                {amountReceived && !receivedValid && (
                  <div className="invalid-feedback">
                    Enter a dollar amount like <strong>12.34</strong> (max 2
                    decimals)
                  </div>
                )}

                {/* 2) Due missing/invalid */}
                {showDueRequiredError && (
                  <div className="invalid-feedback">
                    Enter <strong>Amount Due</strong>
                  </div>
                )}

                {/* Not enough money */}
                {amountReceived && receivedValid && receivedTooLow && (
                  <div className="invalid-feedback">
                    Amount received must be <strong>at least</strong> the amount
                    due.
                  </div>
                )}

                <label
                  htmlFor="amountReceived"
                  className={
                    amountReceived && (!receivedValid || receivedTooLow)
                      ? "text-danger"
                      : ""
                  }
                >
                  {amountReceived && !receivedValid
                    ? "Incorrect Format!"
                    : amountReceived && receivedTooLow
                      ? "More Money Owed!"
                      : "Amount Received"}
                </label>
              </div>

              {/* Calculate Button */}
              <button
                id="calculate"
                className={`btn ${buttonVariant}`}
                disabled={!receivedGreen}
                onClick={() => {
                  setChangeDue(receivedNum - dueNum);
                }}
              >
                Calculate Change
              </button>

              {changeDue !== null && <p>Change Due: ${changeDue.toFixed(2)}</p>}
              {/* RIGHT (col-8): <ResultsPanel /> */}
            </div>
            {/* </div> */}
          </div>

          <div className="col-8">
            {/* ResultsPanel */}
            {changeDue !== null && (
              <div>
                <h2>Change Breakdown</h2>
                <p>Change Due: ${changeDue.toFixed(2)}</p>
                {/* Add breakdown logic here */}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
