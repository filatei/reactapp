import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../mongoose';

jest.mock('mongoose', () => ({
    connect: jest.fn(),
    connection: {
        close: jest.fn(),
    },
    Types: {
        ObjectId: jest.fn(),
    },
}));

describe('MongoDB Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.MONGODB_URI = 'mongodb://test:27017/test';
    });

    it('should connect to MongoDB', async () => {
        (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
        await connectDB();
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
    });

    it('should disconnect from MongoDB', async () => {
        (mongoose.connection.close as jest.Mock).mockResolvedValue(undefined);
        await disconnectDB();
        expect(mongoose.connection.close).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
        const error = new Error('Connection failed');
        (mongoose.connect as jest.Mock).mockRejectedValue(error);

        await expect(connectDB()).rejects.toThrow('Connection failed');
    });

    it('should handle disconnection errors', async () => {
        const error = new Error('Disconnection failed');
        (mongoose.connection.close as jest.Mock).mockRejectedValue(error);

        await expect(disconnectDB()).rejects.toThrow('Disconnection failed');
    });
}); 