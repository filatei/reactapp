import { Types } from 'mongoose';
import mongoose from 'mongoose';

type MongooseDocument = {
    _id?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
};

type PopulatedDocument = {
    _id: Types.ObjectId;
    [key: string]: unknown;
};

type PlainObject = Record<string, unknown>;

/**
 * Converts a Mongoose document or array of documents to plain JavaScript objects
 * Handles ObjectIds, Dates, and nested documents
 */
export function toPlainObject<T extends MongooseDocument>(doc: T | T[] | null): PlainObject | PlainObject[] | null {
    if (!doc) {
        return null;
    }

    if (Array.isArray(doc)) {
        return doc.map(item => toPlainObject(item) as PlainObject);
    }

    const plainObj: PlainObject = {};

    // Handle Mongoose documents
    if (doc instanceof mongoose.Document) {
        const obj = doc.toObject();
        Object.entries(obj).forEach(([key, value]) => {
            if (key === '_id' && value instanceof Types.ObjectId) {
                plainObj.id = value.toString();
                plainObj._id = value.toString(); // Keep _id for backward compatibility
            } else if (value instanceof Types.ObjectId) {
                plainObj[key] = value.toString();
            } else if (value instanceof Date) {
                plainObj[key] = value.toISOString();
            } else if (Array.isArray(value)) {
                plainObj[key] = value.map(item =>
                    item instanceof Types.ObjectId ?
                        item.toString() :
                        item && typeof item === 'object' ?
                            toPlainObject(item as MongooseDocument) :
                            item
                );
            } else if (value && typeof value === 'object') {
                // Handle populated documents
                const populatedDoc = value as PopulatedDocument;
                if (populatedDoc._id) {
                    plainObj[key] = {
                        _id: populatedDoc._id.toString(),
                        ...Object.entries(populatedDoc)
                            .filter(([k]) => k !== '_id')
                            .reduce((acc, [k, v]) => ({
                                ...acc,
                                [k]: v instanceof Types.ObjectId ? v.toString() : v
                            }), {})
                    };
                } else {
                    plainObj[key] = toPlainObject(value as MongooseDocument);
                }
            } else {
                plainObj[key] = value;
            }
        });
    } else {
        // Handle plain objects
        Object.entries(doc).forEach(([key, value]) => {
            if (key === '_id' && value instanceof Types.ObjectId) {
                plainObj.id = value.toString();
                plainObj._id = value.toString(); // Keep _id for backward compatibility
            } else if (value instanceof Types.ObjectId) {
                plainObj[key] = value.toString();
            } else if (value instanceof Date) {
                plainObj[key] = value.toISOString();
            } else if (Array.isArray(value)) {
                plainObj[key] = value.map(item =>
                    item instanceof Types.ObjectId ?
                        item.toString() :
                        item && typeof item === 'object' ?
                            toPlainObject(item as MongooseDocument) :
                            item
                );
            } else if (value && typeof value === 'object') {
                // Handle populated documents
                const populatedDoc = value as PopulatedDocument;
                if (populatedDoc._id) {
                    plainObj[key] = {
                        _id: populatedDoc._id.toString(),
                        ...Object.entries(populatedDoc)
                            .filter(([k]) => k !== '_id')
                            .reduce((acc, [k, v]) => ({
                                ...acc,
                                [k]: v instanceof Types.ObjectId ? v.toString() : v
                            }), {})
                    };
                } else {
                    plainObj[key] = toPlainObject(value as MongooseDocument);
                }
            } else {
                plainObj[key] = value;
            }
        });
    }

    // Remove Mongoose-specific fields
    delete plainObj.__v;

    return plainObj;
}

/**
 * Type guard to check if a value is a Mongoose ObjectId
 */
export function isObjectId(value: unknown): value is Types.ObjectId {
    return value instanceof Types.ObjectId;
}

/**
 * Converts a string ID to a Mongoose ObjectId
 */
export function toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
}

export async function connectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }
    return mongoose.connect(process.env.MONGODB_URI);
}

export async function disconnectDB() {
    return mongoose.connection.close();
} 