import React, { useRef, useEffect } from 'react'

const Canvas = props => {

  const canvasRef = useRef(null)

  const draw = async ctx => {
    console.log(props.imgs)
    ctx.beginPath();

    ctx.rect(20, 30, 130, 110);
    ctx.stroke();
    const image_1 = new Image();
    image_1.src = props.imgs[0].image;
    const image_2 = new Image();
    image_2.src = props.imgs[1].image;
    const image_3 = new Image();
    image_3.src = props.imgs[2].image;
    const image_4 = new Image();
    image_4.src = props.imgs[3].image;
    await ctx.drawImage(image_4,20, 30, ctx.width / 2, ctx.height / 2);
    await ctx.drawImage(image_2, 20, 30,ctx.width / 2, ctx.height / 2);
    await ctx.drawImage(image_3, 20, 30,ctx.width / 2, ctx.height / 2);
    await ctx.drawImage(image_1,20, 30,ctx.width / 2, ctx.height / 2,);

  }
  const images = []
  useEffect(() => {

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    //Our draw come here
    draw(context)
  }, [draw])

  return <canvas ref={canvasRef} {...props} />
}

export default Canvas