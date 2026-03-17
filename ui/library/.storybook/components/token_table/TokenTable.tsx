import "./index.css";
import React from "react";

type TokenRowData = {
  token: string;
  value: string;
};

const TokenRow: React.FC<TokenRowData> = ({ token, value }) => (
  <tr>
    <td>
      <code>{token}</code>
    </td>
    <td>
      <div className="token-preview">
        <span
          className="token-swatch"
          style={{ background: `var(${token})` }}
        />
      </div>
    </td>
    <td>
      <code>{value}</code>
    </td>
  </tr>
);

type TokenTableProps = {
  rows: TokenRowData[];
};

export const TokenTable: React.FC<TokenTableProps> = ({ rows }) => (
  <table className="token-table">
    <thead>
      <tr>
        <th>Token</th>
        <th>Preview</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <TokenRow key={row.token} token={row.token} value={row.value} />
      ))}
    </tbody>
  </table>
);
