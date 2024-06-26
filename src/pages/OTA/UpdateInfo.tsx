import Button from "../../component/common/Button";
import { motion } from "framer-motion";
// @ts-ignore
import truffleHardwareLandscapeIcon from "../../assets/icons/truffle-hardware-landscape.svg";

interface UpdateInfoProps {
  onConfirm: () => void;
  onCancel: () => void;
}
const UpdateInfo = ({ onConfirm, onCancel }: UpdateInfoProps) => {
  return (
    <motion.div className="flex-center flex-col w-[271px]">
      <img src={truffleHardwareLandscapeIcon} alt="" className="w-[118px] h-[68px]" />
      <p className="text-white text-center text-sm mt-[30px]">Update available</p>
      <p className="line-clamp-3 text-center text-xs text-surface-400">In order to update, we need to stop all models running(if any). Are you sure you want to continue?</p>
      <span className="w-full flex gap-[10px] mt-[30px]">
        <Button onClick={onCancel} className="w-full !rounded-sm !bg-surface-500">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="w-full !rounded-sm glass-3d !bg-surface-100">
          Confirm
        </Button>
      </span>
    </motion.div>
  );
};

export default UpdateInfo;
