import { formatDA, formatDate, STATUS } from "../../lib/format";

// One table row (the <tr> is in the parent)
const OrderItem = ({ order }) => {
  const status = STATUS[order.status] || { label: order.status, className: "" };

  return (
    <>
      <td className="pr-6 py-4 text-base whitespace-nowrap">{formatDate(order.createdAt)}</td>
      <td className="pr-6 py-4 text-base whitespace-nowrap">#{order.id.slice(0, 6).toUpperCase()}</td>
      <td className="pr-6 py-4 text-base whitespace-nowrap">
        {order.userFirstName} {order.userLastName}
      </td>
      <td className="pr-6 py-4 text-base whitespace-nowrap">{order.userPhoneNumber}</td>
      <td className="pr-6 py-4 text-base whitespace-nowrap">{formatDA(order.total)}</td>
      <td className="pr-6 py-4 text-base whitespace-nowrap">
        <span className={`px-2 py-1 rounded-xl font-semibold text-xs border ${status.className}`}>
          {status.emoji} {status.label}
        </span>
      </td>
    </>
  );
};

export default OrderItem;
