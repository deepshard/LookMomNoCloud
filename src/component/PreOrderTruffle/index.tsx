import { BrowserWindow } from 'electron/main';
import Button from '../common/Button'
import { shell } from 'electron';

const PreOrderTruffle = () => {
  const handlePreOrder = () => {
    // TODO: Open the pre-order link in the default browser
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden w-full h-full relative p-[17px] pt-[20px] pb-[20px]">
      <div className="flex-grow flex justify-center items-center">
        <img
          src="/src/assets/images/truffle-device.png"
          alt=""
          className="w-[60%] object-contain"
        />
      </div>
      <div className="w-full flex flex-col justify-between items-start px-3 py-2 rounded-lg backdrop-blur-[50px]">
        <div className="flex flex-col">
          <p className="text-surface-500 text-xs">$1,499.00</p>
          <p className="text-surface-main text-xl">Truffle–1</p>
        </div>
        <Button
          className="w-full mt-2 !px-[10px] h-[37px] rounded-[13px] bg-surface-100 border-none glass-3d text-surface-main text-xs"
          onClick={handlePreOrder}
          style={{ borderRadius: '13px' }}
        >
          Pre-order
        </Button>
      </div>
    </div>
  )
}

export default PreOrderTruffle
