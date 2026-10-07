import { Transaction } from '../types/finance';
import { getCurrentMonth, getTodayDate, shiftMonth } from './formatters';

export function getDemoTransactions(): Transaction[] {
  const currentMonth = getCurrentMonth();
  const prevMonth = shiftMonth(currentMonth, -1);
  const prevMonth2 = shiftMonth(currentMonth, -2);

  return [
    // Current Month
    {
      id: 'demo-1',
      userId: 'demo-user',
      title: 'เงินเดือนประจำตำแหน่ง',
      amount: 45000,
      type: 'income',
      category: 'เงินเดือน/ค่าจ้าง',
      date: `${currentMonth}-01`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
      notes: 'เงินเดือนโอนเข้าบัญชีหลัก',
    },
    {
      id: 'demo-2',
      userId: 'demo-user',
      title: 'ค่าเช่าห้องพัก / คอนโด',
      amount: 9500,
      type: 'expense',
      category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
      date: `${currentMonth}-02`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
      notes: 'รวมค่าน้ำไฟเดือนก่อน',
    },
    {
      id: 'demo-3',
      userId: 'demo-user',
      title: 'ซื้อของสดและของใช้ในบ้าน (Lotus)',
      amount: 2350,
      type: 'expense',
      category: 'ช้อปปิ้ง/ของใช้',
      date: `${currentMonth}-03`,
      paymentMethod: 'บัตรเครดิต',
      notes: 'วัตถุดิบทำกับข้าวและน้ำยาซักผ้า',
    },
    {
      id: 'demo-4',
      userId: 'demo-user',
      title: 'เติมน้ำมันรถยนต์',
      amount: 1200,
      type: 'expense',
      category: 'การเดินทาง/น้ำมัน',
      date: `${currentMonth}-04`,
      paymentMethod: 'บัตรเครดิต',
      notes: 'ปั๊ม ปตท.',
    },
    {
      id: 'demo-5',
      userId: 'demo-user',
      title: 'งานรับจ้างออกแบบกราฟิก (ฟรีแลนซ์)',
      amount: 8500,
      type: 'income',
      category: 'งานเสริม/ฟรีแลนซ์',
      date: `${currentMonth}-05`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
      notes: 'งานโลโก้และแบนเนอร์',
    },
    {
      id: 'demo-6',
      userId: 'demo-user',
      title: 'ทานอาหารมื้อเย็นกับครอบครัว',
      amount: 1450,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: `${currentMonth}-05`,
      paymentMethod: 'เงินสด',
      notes: 'ร้านอาหารทะเล',
    },
    {
      id: 'demo-7',
      userId: 'demo-user',
      title: 'กาแฟสด Specialty & เบเกอรี่',
      amount: 165,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: `${currentMonth}-06`,
      paymentMethod: 'TrueMoney Wallet',
      notes: 'ร้านประจำยามเช้า',
    },
    {
      id: 'demo-8',
      userId: 'demo-user',
      title: 'ค่าแพ็กเกจอินเทอร์เน็ตและมือถือ 5G',
      amount: 899,
      type: 'expense',
      category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
      date: `${currentMonth}-06`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
      notes: 'ตัดบัญชีอัตโนมัติ',
    },

    // Previous month (for multi-month comparison)
    {
      id: 'demo-prev-1',
      userId: 'demo-user',
      title: 'เงินเดือน',
      amount: 45000,
      type: 'income',
      category: 'เงินเดือน/ค่าจ้าง',
      date: `${prevMonth}-01`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
    },
    {
      id: 'demo-prev-2',
      userId: 'demo-user',
      title: 'ค่าใช้จ่ายรวมเดือนก่อน',
      amount: 22800,
      type: 'expense',
      category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
      date: `${prevMonth}-15`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
    },

    // 2 Months ago
    {
      id: 'demo-prev-3',
      userId: 'demo-user',
      title: 'เงินเดือน + โบนัสพิเศษ',
      amount: 52000,
      type: 'income',
      category: 'เงินเดือน/ค่าจ้าง',
      date: `${prevMonth2}-01`,
      paymentMethod: 'โอนเงิน / พร้อมเพย์',
    },
    {
      id: 'demo-prev-4',
      userId: 'demo-user',
      title: 'ค่าใช้จ่ายรวมสองเดือนก่อน',
      amount: 25400,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: `${prevMonth2}-18`,
      paymentMethod: 'บัตรเครดิต',
    },
  ];
}
