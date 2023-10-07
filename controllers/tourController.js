const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');



exports.getAllTours = catchAsync(async (req, res, next) => {

        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        })
});

exports.getTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findById(req.params.id);

        if(!tour){
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tours: tour
            }
        })


});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if(!tour){
            return next(new AppError('No tour found with that ID', 404))
        }


        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndDelete(req.params.id);

        if(!tour){
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
})


// Aggregation Pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5} }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numRatings: {$sum: '$ratingsQuantity'},
                    numTours: {$sum: 1},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: {$max: '$price'},
                }
            },
            {
                $sort: {avgPrice: 1}
            }
        
        ])

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
})

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
        const year =req.params.year * 1;

        const plan = await Tour.aggregate([
             {

                $unwind: '$startDates'

             },
             {

                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
             },
             {
                $group: {
                    _id: { $month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {
                        $push: '$name'
                    }
                }
             }, 
             {
                $addField: {
                    month: '$_id'
                }
             }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
})