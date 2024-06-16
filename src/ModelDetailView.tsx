import React from 'react'

function ModelDetailView() {
  return (
    <div className='relative w-full h-full flex flex-col justify-start items-center bg-black/50 bg-blur-[150px] overflow-auto'>

        {/* Nav Bar */}
        <div className='fixed top-0 w-full p-5 gap-5 flex justify-between items-center'>
            {/* Left Side – Model Info*/}
            <div className="w-1/4 flex gap-2.5 justify-start items-center">
                <img
                loading="lazy"
                srcSet="..."
                className="shrink-0 aspect-square w-[30px]"
                />

                <div className='flex flex-col justify-center items-start gap-0.5'>
                    <p className="text-surface-main">LlaMa</p>
                    <p className="text-surface-500 callout-base">Meta</p>
                </div>
            </div>

            {/* Center – Model Info Options*/}
            <div className="flex items-center gap-3 text-surface-500">
                <a>Introduction</a>
                <a>Limitations</a>
                <a>Capabilities</a>
                <a>Risks</a>
                <a>Evals</a>
            </div>

            {/* Right Side – Icons */}
            <div className="w-1/4 flex gap-2 justify-end items-center">
                {/* Play Icon */}
                <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px]">
                    <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/c31ab92a4fd3645efeccc34ee16f392935732535f5c30535bc0d1075fa51c4d7?"
                    className="aspect-[0.92] w-[11px]"
                    />
                </div>

                {/* Share Icon */}
                <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px]">
                    <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/23374506a336f27a2db17d46661c1a3759cb478ef77dd3c76958392ef94852b3?"
                    className="w-2.5 aspect-[0.83]"
                    />
                </div>

                {/* Remove Icon */}
                <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px]">
                    <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d00e4348b5eb774375ed982383fe536b2371afb02773dd032362e43438f93a00?"
                    className="aspect-[0.92] w-[11px]"
                    />
                </div>

                {/* Close Icon */}
                <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px]">
                    <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/186a093a1b5a30895745f9abc67aecc81152635a0a268b0f5251519055ec5078?"
                    className="w-2.5 aspect-[0.83]"
                    />
                </div>
            </div>
        </div>

        {/* Main Section – 100VH */}
        <div className='w-full h-[100vh] max-w-[660px] flex flex-col justify-between items-center p-5 gap-10'>
            {/* DON'T REMOVE – Used for alignment purposes */}
            <div/>

            <div className='relative flex flex-col justify-start items-center'>
                {/* Model's Image */}
                <div className='w-[660px] h-[408px] glass-3d rounded-2xl overflow-hidden'>
                    <img src='https://storage.googleapis.com/model_background_images/119e0024-5a46-4ea2-8dfc-9ba6bd04770f.png' className=' glass-3d w-full h-full'/>
                </div>

                {/* Model's Name */}
                <div className='absolute -bottom-10 flex flex-col items-start gap-0.5'>
                    <p className='heading-md text-surface-main'>GPT-4 with Vision</p>
                    {/* <p className='title-xs text-surface-500'>by Meta</p> */}
                </div>
            </div>
            

            {/* Model's Info */}
            <div className='flex flex-col justify-end items-center gap-5'>
                <p className='text-surface-500'>Created May 13, 2024  •  Last Updated: Today</p>

                <div className="flex gap-2.5 text-sm text-white text-opacity-80">
                    {/* Author Tag */}
                    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full">
                        <img
                        loading="lazy"
                        srcSet="..."
                        className="shrink-0 aspect-square w-[17px]"
                        />
                        <div>Meta</div>
                    </div>
                    
                    {/* Size Tag */}
                    <div className="justify-center px-2.5 py-1.5 bg-surface-100 rounded-full">
                        Size: 7B
                    </div>

                    {/* Downloads Tag */}
                    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 bg-surface-100 rounded-full">
                        <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/ca057c15afe4541dda72dcb2f8ca4f9f71c6d2b95d16f542b67d49e8075f2729?"
                        className="shrink-0 my-auto w-3.5 aspect-[1.08]"
                        />
                        <div>100k </div>
                    </div>

                    {/* Likes/Bookmarks Tag */}
                    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full">
                        <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/e0bb8a4835580e7a1cfb71924c7fae68cb8d90ef93ccb81960418001d562993e?"
                        className="shrink-0 my-auto w-3.5 aspect-[1.08]"
                        />
                        <div>360k</div>
                    </div>
                </div>
            </div>
        </div>

        {/* To Do: a Map with all sections – Limitations, Capabilities, Risks, Evals, etc */}

        {/* Paragraph Section */}
        <div className='w-[660px] flex flex-col justify-start items-start gap-2.5'>
            {/* Section Title */}
            <p className='title-base text-surface-500'>Limitations</p>

            {/* Section Text */}
            <p className='text-surface-main body-long'>
            GPT-4 with vision (GPT-4V) enables users to instruct GPT-4 to analyze 
            image inputs provided by the user, and is the latest capability we are 
            making broadly available. Incorporating additional modalities (such as image inputs) 
            into large language models (LLMs) is viewed by some as a key frontier in artificial 
            intelligence research and development. Multimodal LLMs offer the possibility of 
            expanding the impact of language-only systems with novel interfaces and capabilities, 
            enabling them to solve new tasks and provide novel experiences for their users. 
            In this system card, we analyze the safety properties of GPT-4V. Our work on safety 
            for GPT-4V builds on the work done for GPT-4 and here we dive deeper into the evaluations, 
            preparation, and mitigation work done specifically for image inputs.
            </p>
        </div>
    </div>
  )
}

export default ModelDetailView