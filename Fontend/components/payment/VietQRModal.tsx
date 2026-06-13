'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/config'

interface VietQRModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number
  amount: number
  onSuccess?: () => void
}

interface VietQRData {
  appointmentId: number
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
  transferContent: string
  qrCodeData: string
}

export function VietQRModal({ isOpen, onClose, appointmentId, amount, onSuccess }: VietQRModalProps) {
  const [loading, setLoading] = useState(false)
  const [vietQRData, setVietQRData] = useState<VietQRData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerateQR = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/vietqr/generate`,
        { appointmentId },
        { withCredentials: true }
      )
      setVietQRData(response.data)
    } catch (error) {
      console.error('Generate VietQR failed:', error)
      alert('Không thể tạo mã QR. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleConfirmPayment = async () => {
    if (!vietQRData) return
    
    setProcessing(true)
    try {
      // Mock: Auto-generate transaction ID and process payment
      const mockTransactionId = 'VQR' + Math.random().toString(36).substring(2, 10).toUpperCase()
      
      await axios.post(
        `${API_BASE_URL}/api/payments/vietqr/process`,
        {
          appointmentId: vietQRData.appointmentId,
          transactionId: mockTransactionId
        },
        { withCredentials: true }
      )

      alert('Thanh toán thành công!')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Process payment failed:', error)
      alert('Xác nhận thanh toán thất bại. Vui lòng thử lại.')
    } finally {
      setProcessing(false)
    }
  }

  const handleOpen = () => {
    if (!vietQRData) {
      handleGenerateQR()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={handleOpen}>
        <DialogHeader>
          <DialogTitle>Thanh toán VietQR</DialogTitle>
          <DialogDescription>
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Đang tạo mã QR...</p>
          </div>
        ) : vietQRData ? (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center mb-2">
                  <p className="text-xs text-gray-500">QR Code Mock</p>
                </div>
                <p className="text-xs text-muted-foreground">Quét mã QR để thanh toán</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Ngân hàng</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={vietQRData.bankName}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(vietQRData.bankName, 'bank')}
                  >
                    {copied === 'bank' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Số tài khoản</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={vietQRData.accountNumber}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(vietQRData.accountNumber, 'account')}
                  >
                    {copied === 'account' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Tên tài khoản</label>
                <input
                  type="text"
                  value={vietQRData.accountName}
                  readOnly
                  className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Số tiền</label>
                <input
                  type="text"
                  value={`${vietQRData.amount.toLocaleString('vi-VN')} VND`}
                  readOnly
                  className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Nội dung chuyển khoản</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={vietQRData.transferContent}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-yellow-50 font-semibold"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(vietQRData.transferContent, 'content')}
                  >
                    {copied === 'content' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-amber-600">⚠️ Vui lòng giữ nguyên nội dung chuyển khoản</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đã thanh toán'
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
