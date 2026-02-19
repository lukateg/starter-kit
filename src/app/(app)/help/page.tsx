"use client";

import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers, tutorials, and get in touch with our support team
        </p>
      </div>

      {/* Search */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="How can we help you today?"
              className="pl-12 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* <div>
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.title}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div> */}

      {/* FAQs */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card> */}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="integration">Integration Help</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Submit Ticket
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium">System Status</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium">Community Forum</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium">Feature Roadmap</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium">Changelog</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
        </CardContent>
      </Card> */}
    </div>
  );
}
