import Tooltip from "./Tooltip";
//@ts-ignore
import errorIcon from "../../assets/icons/error.svg";

interface ErrorProps {
    errorMessage: string;
    image: any;
}

export const getErrorContent = (errorMessage: string) => {
    return (
      <div className='w-full flex flex-col rounded-xs bg-white/20 backdrop-blur-3xl p-2.5 gap-2 justify-start items-stretch'>
        <div className='flex justify-start items-center gap-1.5 text-surface-main'>
          <img src={errorIcon} alt="errorIcon" className="h-3 text-error-regular" />

          <p>An Error Occurred</p>
        </div>

        {/* Divider */}
        <div className='w-full h-[0.5px] bg-surface-100' />

        <p className='body-xs text-surface-500 leading-snug'>{errorMessage}</p>
      </div>
    );
}

export const Error = ({ errorMessage, image }: ErrorProps) => {
    return (
        <Tooltip
            overlayClassName="bg-black/20 rounded-sm backdrop-blur-2xl min-w-[200px]"
            overlayInnerStyle={{
                color: 'surface-500',
                padding: '5px',
                fontSize: '12px',
            }}
            placement="bottom"
            color="transparent"
            title={getErrorContent(errorMessage)}
        >
            {image}
        </Tooltip>
    );
}