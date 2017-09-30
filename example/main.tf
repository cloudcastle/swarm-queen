variable "deepstream_url" {}

resource "aws_instance" "swarmfarm" {
  ami           = "ami-55eb0a2f" // pick a HVM image for your region from https://coreos.com/os/docs/latest/booting-on-ec2.html
  instance_type = "t2.micro"
  user_data = "${data.template_file.cloudconfig.rendered}"
  # key_name = "name-of-your-aws-ssh-key"
  # security_groups = ["default"]
  count = 3
}

data "template_file" "cloudconfig" {
  template = "${file("${path.module}/cloudconfig.tpl")}"
  vars {
    deepstream_url = "${var.deepstream_url}"
  }
}
