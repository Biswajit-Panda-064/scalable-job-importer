import ImportLog from '../model/importLogModel.js';


export const getImportLogs = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            ImportLog.find()
                .sort({ importDateTime: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ImportLog.countDocuments()
        ]);

        res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('Error fetching import logs:', err);
        res.status(500).json({ error: 'Failed to fetch import logs' });
    }
};
