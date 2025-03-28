import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface CreateProjectButtonProps extends ButtonProps {
	onClick: () => void;
	children?: React.ReactNode;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({
	onClick,
	children = "Create Project",
	...props
}) => {
	return (
		<Button onClick={onClick} className="flex items-center gap-2" {...props}>
			<PlusIcon size={16} />
			{children}
		</Button>
	);
};

export default CreateProjectButton;
