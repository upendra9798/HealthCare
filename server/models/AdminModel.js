import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin"
  }
}, { timestamps: true });

  adminSchema.pre("save",async function(next){
        const salt=await genSalt();
        this.password=await hash(this.password,salt);
        next();
    });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
