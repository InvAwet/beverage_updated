import { DownloadIcon, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VatReceipt as VatReceiptType } from "@shared/schema";

type VatReceiptProps = {
  receipt: VatReceiptType;
  order: any;
  orderItems: any[];
  onDownload: () => void;
  onShare: () => void;
};

export default function VatReceipt({
  receipt,
  order,
  orderItems,
  onDownload,
  onShare
}: VatReceiptProps) {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="text-center mb-4">
            <h3 className="font-heading font-semibold text-gray-800 text-lg">SALES VAT RECEIPT</h3>
            <p className="text-sm text-gray-600">DeliverEth Beverage Distributor</p>
          </div>
          
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-gray-600 mb-1">Receipt No:</p>
              <p className="font-medium text-gray-800">{receipt.receiptNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Date:</p>
              <p className="font-medium text-gray-800">{formatDate(receipt.issuedAt.toString())}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Seller:</p>
            <p className="font-medium text-gray-800">{receipt.sellerName}</p>
            <p className="text-sm text-gray-600">TIN: {receipt.sellerTin}</p>
            <p className="text-sm text-gray-600">VAT Reg. No: V{receipt.sellerTin}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Buyer:</p>
            <p className="font-medium text-gray-800">{receipt.buyerName}</p>
            <p className="text-sm text-gray-600">TIN: {receipt.buyerTin}</p>
          </div>
          
          <Separator className="my-4" />
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2 font-medium text-gray-600">Item</th>
                <th className="text-center pb-2 font-medium text-gray-600">Qty</th>
                <th className="text-right pb-2 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 text-gray-800">{item.beverage.name}</td>
                  <td className="py-2 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-800">{item.subtotal.toFixed(0)} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Separator className="my-4" />
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">{receipt.subtotal.toFixed(0)} ETB</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">VAT (15%):</span>
              <span className="text-gray-800">{receipt.vatAmount.toFixed(0)} ETB</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span className="text-primary">{receipt.total.toFixed(0)} ETB</span>
            </div>
            {order?.deliveryFee && (
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Delivery Fee (Non-VAT):</span>
                <span>{order.deliveryFee.toFixed(0)} ETB</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="h-32 w-32 border border-gray-200 rounded flex items-center justify-center">
              <p className="text-xs text-gray-500">QR Code</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">This is a valid VAT receipt as per ERCA regulations</p>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="border-primary text-primary"
          onClick={onDownload}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button onClick={onShare}>
          <ShareIcon className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
