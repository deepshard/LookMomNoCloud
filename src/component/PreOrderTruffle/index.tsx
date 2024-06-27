const PreOrderTruffle = () => {
  const handlePreOrder = () => {
    // TODO: Open the pre-order link in the default browser
    window.electronShell.openExternal('https://preorder.itsalltruffles.com/');
  };

  return (
    <div className="group transition ease-out duration-500 flex flex-col rounded-lg overflow-hidden w-full h-full relative p-[17px] pt-[20px] pb-[20px]">
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
        <button
          className="h-0 h-10 opacity-100 transition ease-out duration-500 w-full mt-2 !px-2.5 rounded-sm bg-transparent  hover:bg-bg-wdget border-none glass-3d text-surface-main"
          onClick={handlePreOrder}
          style={{ borderRadius: '13px' }}
        >
          Pre-Order
        </button>
      </div>
    </div>
  )
}

export default PreOrderTruffle;