import { TModel } from '../types/schemas'

type SystemUsage = {
    memory: number
    storage: number
}

interface SystemInfoProps {
    /**
     * The background color of the sysinfo card
     */
    backgroundColor?: string
    /**
     * The color of the modal when the user hovers over the sysinfo card
     */
    modalColor?: string
    /**
     * The models that are currently running on the users PC
     */
    runningModels?: TModel[]
    /**
     * The usage of the system resources
     */
    usage: SystemUsage
    /**
     * The name of the system (eg. 4090, Mac pro, etc.)
     */
    systemName: string

    onClick?: () => void
    onHover?: () => void
}

const SystemInfo = ({
    ...props
}: SystemInfoProps) => {
    return (
        <div >
            
        </div>
    );
}

export default SystemInfo;
