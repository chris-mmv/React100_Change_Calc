import "./App.css";
import { useState, useEffect, useRef } from "react";

const DENOMS = [
  { key: "twenties", label: "$20", cents: 2000 },
  { key: "tens", label: "$10", cents: 1000 },
  { key: "fives", label: "$5", cents: 500 },
  { key: "ones", label: "$1", cents: 100 },
  { key: "quarters", label: "25¢", cents: 25 },
  { key: "dimes", label: "10¢", cents: 10 },
  { key: "nickels", label: "5¢", cents: 5 },
  { key: "pennies", label: "1¢", cents: 1 },
];

function App() {
  const [amountDue, setAmountDue] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [changeDue, setChangeDue] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [breakdown, setBreakdown] = useState(null);

  //useRef for background layer motion effect
  const bgRef = useRef(null);

  //mouse follow motion for background effect
  useEffect(() => {
    let rafId = null;

    const handleMouseMove = (e) => {
      if (!bgRef.current) return;

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;

        // normalize mouse position (-0.5 to 0.5)
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;

        // control intensity here

        const intensity = 60;

        const dx = x * intensity;
        const dy = y * intensity;

        bgRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;

        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  //calculate breakdown of denominations
  //returns object with breakdown of denominations: { twenties: x, tens: y, ... }
  function calcBreakdown(owed, paid) {
    let cents = Math.round((paid - owed) * 100);

    const breakdown = {};
    for (const d of DENOMS) {
      const count = Math.floor(cents / d.cents);
      breakdown[d.key] = count;
      cents -= count * d.cents;
    }
    return breakdown;
  }

  const moneyRegex = /^\d+(\.\d{1,2})?$/;

  const isMoney = (v) => v !== "" && moneyRegex.test(v);

  const toMoneyNumber = (v) => (isMoney(v) ? parseFloat(v) : NaN);

  const moreMoney = (dueStr, receivedStr) => {
    if (!isMoney(dueStr) || !isMoney(receivedStr)) return false;
    return toMoneyNumber(dueStr) > toMoneyNumber(receivedStr);
  };

  //return error is amountDue in invalid format
  const getDueError = (dueStr) => {
    if (!dueStr) return null;
    if (!isMoney(dueStr)) return "format";
    return null;
  };

  //return error if amountReceived is invalid format or less than amountDue
  //if moreMoney disabled for NPM test compatibility
  const getReceivedError = (dueStr, receivedStr) => {
    if (!receivedStr) return null;
    if (!isMoney(receivedStr)) return "format";
    // if (moreMoney(dueStr, receivedStr)) return "tooLow";
    return null;
  };

  const dueError = getDueError(amountDue);

  const receivedError = getReceivedError(amountDue, amountReceived);

  const dueNum = toMoneyNumber(amountDue);

  const receivedNum = toMoneyNumber(amountReceived);

  const canCalc = isMoney(amountDue) && isMoney(amountReceived);
  // && !incorrectMoney;
  // cannot disable button because of NPM test... :(

  const hasAnyInput = amountDue !== "" || amountReceived !== "";

  // const buttonVariant = !hasAnyInput
  //   ? "btn-primary"
  //   : canCalc
  //     ? "btn-success"
  //     : "btn-danger";

  //better way to write the buttonVariant logic (Eddy suggestion)
  //defaults to primary, changes to success or danger based on canCalc
  const buttonVariant = hasAnyInput
    ? canCalc
      ? "btn-success"
      : "btn-danger"
    : "btn-primary";

  const handleDueChange = (e) => {
    setAmountDue(e.target.value);
    setChangeDue(null);
    setShowResults(false);
    setBreakdown(null);
  };

  const handleReceivedChange = (e) => {
    setAmountReceived(e.target.value);
    setChangeDue(null);
    setShowResults(false);
    setBreakdown(null);
  };

  //useEffect to calculate in the background, once canCalc is true
  useEffect(() => {
    if (!canCalc) {
      setBreakdown(null);
      return;
    }

    const computed = calcBreakdown(dueNum, receivedNum);
    setBreakdown(computed);
  }, [canCalc, dueNum, receivedNum]);

  return (
    <>
      <div className="bg-layer" ref={bgRef} />
      <div className="app-content">
        <header
          className={`bg-dark mb-4 ${changeDue < 0 ? "text-danger" : "text-success"}`}
        >
          <div className="container text-center py-4">
            <div className="col">
              <h1 className="display-2 border-bottom pb-3">
                Change Calculator
              </h1>
            </div>
          </div>
        </header>

        <main>
          <div className="container">
            <div className="row g-3 justify-content-center">
              {/* input container */}
              <div className="col-12 col-lg-4 p-5">
                <div className="card p-3 bg-body-secondary">
                  <h5 className="card-title">Enter Information:</h5>
                  {/* Amount Due Input */}
                  <div className="form-floating mb-4">
                    <input
                      className={`form-control ${
                        amountDue ? (dueError ? "is-invalid" : "is-valid") : ""
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

                    {dueError === "format" && (
                      <div className="text-danger small mt-1 d-block">
                        Enter a dollar amount like <strong>12.34</strong> (max 2
                        decimals)
                      </div>
                    )}

                    <label
                      htmlFor="amountDue"
                      className={dueError ? "text-danger" : ""}
                    >
                      {dueError === "format"
                        ? "Amount Due (Invalid Format)"
                        : "Amount Due"}
                    </label>
                  </div>

                  {/* Amount Received Input */}
                  <div className="form-floating mb-4">
                    <input
                      className={`form-control ${
                        amountReceived
                          ? receivedError
                            ? "is-invalid"
                            : "is-valid"
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
                    {receivedError === "format" && (
                      <div className="text-danger small mt-1 d-block">
                        Enter a dollar amount like <strong>12.34</strong>
                      </div>
                    )}

                    {receivedError === "tooLow" && (
                      <div className="text-danger small mt-1 d-block">
                        Amount received must be <strong>at least</strong> the
                        amount due
                      </div>
                    )}

                    <label
                      htmlFor="amountReceived"
                      className={receivedError ? "text-danger" : ""}
                    >
                      {receivedError === "format"
                        ? "Amount Received (Invalid Format)"
                        : receivedError === "tooLow"
                          ? "More Money Owed"
                          : "Amount Received"}
                    </label>
                  </div>

                  {/* Calculate Button */}
                  <button
                    id="calculate"
                    data-testid="calculate"
                    className={`btn ${buttonVariant}`}
                    disabled={!canCalc}
                    onClick={() => {
                      const diff = receivedNum - dueNum; // may be negative
                      setChangeDue(diff);
                      setShowResults(true);

                      if (diff >= 0) {
                        setBreakdown(calcBreakdown(dueNum, receivedNum));
                      } else {
                        // optional: set all denoms to 0 so UI is consistent
                        const zeros = Object.fromEntries(
                          DENOMS.map((d) => [d.key, 0]),
                        );
                        setBreakdown(zeros);
                      }
                    }}
                  >
                    Calculate Change
                  </button>
                </div>
              </div>
            </div>

            {/* Results Modal*/}
            {showResults && (
              <>
                <div className="modal d-block" tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered modal-offset">
                    <div className="modal-content">
                      <div
                        className={`modal-header ${
                          changeDue >= 0
                            ? "bg-success text-white"
                            : "bg-danger text-white"
                        }`}
                      >
                        <h5 className="modal-title text-center w-100">
                          {changeDue >= 0
                            ? `The total change due is $${changeDue.toFixed(2)}`
                            : `Additional money owed is $${Math.abs(changeDue).toFixed(2)}`}
                        </h5>
                      </div>

                      <div className="modal-body">
                        {breakdown && (
                          <div className="row g-2">
                            {DENOMS.map((d) => {
                              const count = breakdown[d.key] ?? 0;
                              const cardClass =
                                count === 0
                                  ? "bg-danger-subtle"
                                  : "border-success";

                              return (
                                <div className="col-6 col-md-3" key={d.key}>
                                  <div
                                    className={`card text-center ${cardClass}`}
                                  >
                                    <div className="card-body p-2">
                                      <div className="fw-bold">{d.label}</div>
                                      <div data-testid={d.key}>
                                        {String(count)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="modal-footer">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowResults(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-backdrop fade show"></div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
