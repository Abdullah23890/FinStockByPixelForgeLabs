import Developers from "../models/Developer.js";

export const createDeveloperContact = async (req, res) => {
    try {

        const existDeveloperCOntact = await Developers.findOne();
        if(existDeveloperCOntact){
            return res.status(400).json({
                success : false,
                message : "Developer Contact Exists."
            })
        }

        const {
            name,
            tagLine,
            email,
            phone,
            services,
            website
        } = req.body;

        const newDeveloper = await Developers.create(
            {
                name,
                tagLine,
                email,
                phone,
                services,
                website
            }
        );

        const developerObject = newDeveloper.toObject();

        return res.status(201).json({
            success : true,
            message : "Developer Contact Created Successfully.",
            data : developerObject
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message : "Internal Server Error."
        })
    }
}

export const getDeveloperContact = async (req, res) => {
    try {

        const contact = await Developers.findOne();
        if(!contact){
            return res.status(404).json({
                success : false,
                message : "Contact Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Developer Contact Fetched.",
            data : contact
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}