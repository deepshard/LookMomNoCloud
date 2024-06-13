import { Button } from "antd"


const PreOrderTruffle = () => {
  return (
    <div className='flex flex-col rounded-lg overflow-hidden w-full h-full relative'>
      <img src="/assets/images/preorder-hardware.png" alt="" />
      <div className=' absolute bottom-0 right-0 w-full h-[87px] flex justify-between items-center px-3 rounded-lg backdrop-blur-[50px] bg-surface-300'>
        <span>
          <p>$1,299.00</p>
          <p>Truffle–1</p>
        </span>
        <Button className='!px-[10px] rounded-[100px] bg-surface-100 border-none glass-3d text-surface-main'>Pre-order</Button>
      </div>
    </div>
  )
}

export default PreOrderTruffle