const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
}








// const asyncHandler = (fb)=> async(req,res,next)=>{
//     try {
//         await fb(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message :err.message
//         })
//     }
// }



export { asyncHandler }